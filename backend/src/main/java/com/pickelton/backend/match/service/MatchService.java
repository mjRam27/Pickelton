package com.pickelton.backend.match.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchParticipantStatus;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.ScoreEventType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.AddPointRequest;
import com.pickelton.backend.match.dto.AssignScorekeeperRequest;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.LiveMatchStateResponse;
import com.pickelton.backend.match.dto.ManualScoreCorrectionRequest;
import com.pickelton.backend.match.dto.MatchParticipantResponse;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.MatchScorecardResponse;
import com.pickelton.backend.match.dto.ScorekeeperSearchResponse;
import com.pickelton.backend.match.dto.UpdateMatchScoreRequest;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.match.entity.MatchState;
import com.pickelton.backend.match.entity.ScoreEvent;
import com.pickelton.backend.match.entity.TournamentMatch;
import com.pickelton.backend.match.repository.MatchParticipantRepository;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.match.repository.MatchStateRepository;
import com.pickelton.backend.match.repository.ScoreEventRepository;
import com.pickelton.backend.match.repository.TournamentMatchRepository;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository participantRepository;
    private final MatchStateRepository stateRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final LiveMatchStateService liveStateService;
    private final ScoreBroadcastService scoreBroadcastService;
    private final MatchMapper matchMapper;

    public MatchResponse createMatch(CreateMatchRequest request) {
        MatchMode mode = resolvedMode(request);
        Tournament tournament = null;
        UUID tournamentId = null;
        if (mode == MatchMode.TOURNAMENT) {
            if (request.tournamentId() == null) {
                throw new BadRequestException("Tournament is required for tournament matches");
            }
            if (request.round() == null || request.round().isBlank()) {
                throw new BadRequestException("Round is required for tournament matches");
            }
            tournament = requireTournament(request.tournamentId());
            requireOrganizer(tournament);
            if (tournament.getStatus() == TournamentStatus.FINISHED || tournament.getStatus() == TournamentStatus.CANCELLED) {
                throw new BadRequestException("Matches cannot be created for a closed tournament");
            }
            tournamentId = tournament.getId();
        }

        String round = mode == MatchMode.CASUAL ? "Friendly Match" : request.round().trim();
        Match match = matchRepository.save(Match.builder()
            .round(round)
            .status(MatchStatus.SCHEDULED)
            .rules(defaultRules(request.rules()))
            .venue(request.venue())
            .scheduledAt(request.scheduledAt())
            .build());
        if (tournament != null) {
            tournamentMatchRepository.save(TournamentMatch.builder()
                .match(match)
                .tournament(tournament)
                .displayOrder((int) tournamentMatchRepository.countByTournamentId(tournament.getId()) + 1)
                .build());
        }
        List<MatchParticipant> participants = saveParticipants(match, request, tournamentId);
        OffsetDateTime now = OffsetDateTime.now();
        MatchState state = stateRepository.save(MatchState.builder()
            .match(match)
            .scores(initialScores())
            .sets(new ArrayList<>())
            .revision(0L)
            .lastEventAt(now)
            .build());
        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.MATCH_CREATED,
            Map.of("scores", state.getScores()), nextSequence(match.getId()));
        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cache(liveState);
        return matchMapper.toResponse(match, tournamentId, participants, state);
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatch(UUID id) {
        Match match = requireMatch(id);
        return response(match);
    }

    @Transactional(readOnly = true)
    public LiveMatchStateResponse getLiveScore(UUID id) {
        return liveStateService.get(id).orElseGet(() -> {
            Match match = requireMatch(id);
            LiveMatchStateResponse state = liveState(match, requireState(id));
            liveStateService.cache(state);
            return state;
        });
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getTournamentMatches(UUID tournamentId) {
        requireTournament(tournamentId);
        return tournamentMatchRepository.findByTournamentIdOrderByDisplayOrderAscCreatedAtAsc(tournamentId).stream()
            .map(TournamentMatch::getMatch)
            .map(this::response)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ScorekeeperSearchResponse> searchScorekeepers(UUID tournamentId, String query) {
        Tournament tournament = requireTournament(tournamentId);
        requireOrganizer(tournament);
        String normalized = query == null ? "" : query.trim();
        if (normalized.isBlank()) {
            throw new BadRequestException("Search query is required");
        }
        return userRepository.searchByNameEmailOrPhone(normalized, PageRequest.of(0, 20)).stream()
            .map(user -> new ScorekeeperSearchResponse(user.getId(), user.getName(), user.getEmail(), user.getPhoneNumber()))
            .toList();
    }

    public MatchResponse assignScorekeeper(UUID matchId, AssignScorekeeperRequest request) {
        Match match = requireMatch(matchId);
        requireOrganizer(tournamentForMatch(matchId));
        User scorekeeper = requireUser(request.userId(), "Scorekeeper");

        List<MatchParticipant> scorers =
            participantRepository.findByMatchIdAndRoleOrderByCreatedAtDesc(matchId, MatchParticipantRole.SCORER);
        MatchParticipant selected = null;
        for (MatchParticipant scorer : scorers) {
            if (scorer.getUser().getId().equals(scorekeeper.getId())) {
                scorer.setStatus(MatchParticipantStatus.ACCEPTED);
                selected = participantRepository.save(scorer);
            } else if (scorer.getStatus() != MatchParticipantStatus.DECLINED) {
                scorer.setStatus(MatchParticipantStatus.DECLINED);
                participantRepository.save(scorer);
            }
        }

        if (selected == null) {
            selected = participantRepository.save(MatchParticipant.builder()
                .match(match)
                .user(scorekeeper)
                .role(MatchParticipantRole.SCORER)
                .status(MatchParticipantStatus.ACCEPTED)
                .build());
        }

        return response(match);
    }

    @Transactional(readOnly = true)
    public MatchScorecardResponse getScorecard(UUID id) {
        Match match = requireMatch(id);
        MatchState state = requireState(id);
        return scorecard(match, state);
    }

    public MatchScorecardResponse addPoint(UUID matchId, AddPointRequest request) {
        Match match = requireMatch(matchId);
        requireAssignedScorekeeper(match);
        ensureMatchEditable(match);

        MatchState state = requireState(matchId);
        String teamCode = normalizeTeamCode(request.teamCode());
        Map<String, Integer> beforeScores = new LinkedHashMap<>(state.getScores());
        if (!beforeScores.containsKey(teamCode)) {
            throw new BadRequestException("Invalid team code");
        }
        Map<String, Integer> afterScores = new LinkedHashMap<>(beforeScores);
        afterScores.put(teamCode, beforeScores.getOrDefault(teamCode, 0) + 1);

        state.setScores(afterScores);
        state.setRevision(state.getRevision() + 1);
        OffsetDateTime now = OffsetDateTime.now();
        state.setLastEventAt(now);
        if (match.getStatus() == MatchStatus.SCHEDULED) {
            match.setStatus(MatchStatus.IN_PROGRESS);
        }
        stateRepository.save(state);
        matchRepository.save(match);

        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.POINT_ADDED, Map.of(
            "teamCode", teamCode,
            "beforeScores", beforeScores,
            "afterScores", afterScores,
            "undone", false
        ), nextSequence(matchId));

        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cacheAndPublish(liveState);
        scoreBroadcastService.broadcastScoreUpdate(match.getId(), liveState);
        return scorecard(match, state);
    }

    public MatchScorecardResponse undoLastScore(UUID matchId) {
        Match match = requireMatch(matchId);
        requireAssignedScorekeeper(match);
        ensureMatchEditable(match);

        MatchState state = requireState(matchId);
        ScoreEvent latestPoint = latestActivePointEvent(matchId).orElseThrow(() ->
            new BadRequestException("No active score event to undo"));

        Map<String, Integer> beforeScores = mapFromPayload(latestPoint.getPayload().get("beforeScores"));
        Map<String, Integer> afterScores = new LinkedHashMap<>(state.getScores());
        if (beforeScores.isEmpty()) {
            throw new BadRequestException("Latest score event is not undoable");
        }

        OffsetDateTime now = OffsetDateTime.now();
        state.setScores(new LinkedHashMap<>(beforeScores));
        state.setRevision(state.getRevision() + 1);
        state.setLastEventAt(now);
        stateRepository.save(state);

        Map<String, Object> latestPayload = new LinkedHashMap<>(latestPoint.getPayload());
        latestPayload.put("undone", true);
        latestPayload.put("undoneAt", now.toString());
        latestPayload.put("undoneBy", currentUserService.getUserId().toString());
        latestPoint.setPayload(latestPayload);
        scoreEventRepository.save(latestPoint);

        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.UNDO, Map.of(
            "undoneEventId", latestPoint.getId().toString(),
            "beforeScores", afterScores,
            "afterScores", beforeScores
        ), nextSequence(matchId));

        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cacheAndPublish(liveState);
        scoreBroadcastService.broadcastScoreUpdate(match.getId(), liveState);
        return scorecard(match, state);
    }

    public MatchScorecardResponse manualCorrection(UUID matchId, ManualScoreCorrectionRequest request) {
        Match match = requireMatch(matchId);
        requireAssignedScorekeeper(match);
        ensureMatchEditable(match);

        MatchState state = requireState(matchId);
        Map<String, Integer> beforeScores = new LinkedHashMap<>(state.getScores());
        Map<String, Integer> afterScores = new LinkedHashMap<>(Map.of("A", request.scoreA(), "B", request.scoreB()));

        state.setScores(afterScores);
        state.setRevision(state.getRevision() + 1);
        OffsetDateTime correctedAt = OffsetDateTime.now();
        state.setLastEventAt(correctedAt);
        if (match.getStatus() == MatchStatus.SCHEDULED && (request.scoreA() > 0 || request.scoreB() > 0)) {
            match.setStatus(MatchStatus.IN_PROGRESS);
            matchRepository.save(match);
        }
        stateRepository.save(state);

        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.MANUAL_CORRECTION, Map.of(
            "beforeScores", beforeScores,
            "afterScores", afterScores,
            "reason", request.reason().trim(),
            "correctedBy", currentUserService.getUserId().toString(),
            "correctedAt", correctedAt.toString()
        ), nextSequence(matchId));

        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cacheAndPublish(liveState);
        scoreBroadcastService.broadcastScoreUpdate(match.getId(), liveState);
        return scorecard(match, state);
    }

    public MatchScorecardResponse completeMatch(UUID matchId) {
        Match match = requireMatch(matchId);
        requireAssignedScorekeeper(match);
        ensureMatchEditable(match);

        MatchState state = requireState(matchId);
        String winningTeam = determineWinningTeam(state.getScores(), match.getRules())
            .orElseThrow(() -> new BadRequestException("Winning rules are not satisfied yet"));
        User winner = winnerForTeam(matchId, winningTeam)
            .orElseThrow(() -> new BadRequestException("Unable to resolve winner from match participants"));

        OffsetDateTime now = OffsetDateTime.now();
        match.setWinner(winner);
        match.setStatus(MatchStatus.COMPLETED);
        matchRepository.save(match);

        state.setRevision(state.getRevision() + 1);
        state.setLastEventAt(now);
        stateRepository.save(state);

        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.MATCH_COMPLETED, Map.of(
            "scores", state.getScores(),
            "winnerTeamCode", winningTeam,
            "winnerId", winner.getId().toString(),
            "completedAt", now.toString()
        ), nextSequence(matchId));

        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cacheAndPublish(liveState);
        scoreBroadcastService.broadcastScoreUpdate(match.getId(), liveState);
        return scorecard(match, state);
    }

    public MatchResponse updateScore(UUID id, UpdateMatchScoreRequest request) {
        Match match = requireMatch(id);
        requireAssignedScorekeeper(match);
        ensureMatchEditable(match);
        MatchState state = requireState(id);
        Map<String, Integer> oldScores = new LinkedHashMap<>(state.getScores());
        state.setScores(new LinkedHashMap<>(Map.of("A", request.score1(), "B", request.score2())));
        state.setRevision(state.getRevision() + 1);
        state.setLastEventAt(OffsetDateTime.now());
        if (match.getStatus() == MatchStatus.SCHEDULED) {
            match.setStatus(MatchStatus.IN_PROGRESS);
        }
        stateRepository.save(state);
        matchRepository.save(match);
        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.SCORE_UPDATED,
            Map.of("oldScores", oldScores, "scores", state.getScores()), nextSequence(id));
        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cacheAndPublish(liveState);
        scoreBroadcastService.broadcastScoreUpdate(match.getId(), liveState);
        return response(match);
    }

    public MatchResponse cancelMatch(UUID id) {
        Match match = requireMatch(id);
        requireOrganizer(tournamentForMatch(id));
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new BadRequestException("Completed match cannot be cancelled");
        }
        match.setStatus(MatchStatus.CANCELLED);
        Match saved = matchRepository.save(match);
        LiveMatchStateResponse liveState = liveState(saved, requireState(id));
        liveStateService.cacheAndPublish(liveState);
        scoreBroadcastService.broadcastScoreUpdate(saved.getId(), liveState);
        return response(saved);
    }

    private List<MatchParticipant> saveParticipants(Match match, CreateMatchRequest request, UUID tournamentId) {
        List<CreateMatchRequest.ParticipantRequest> requested = normalizedPlayers(request);
        if (requested.stream().filter(participant -> participant.role() == MatchParticipantRole.PLAYER).count() < 2) {
            throw new BadRequestException("At least two players are required");
        }
        List<MatchParticipant> participants = new ArrayList<>();
        for (CreateMatchRequest.ParticipantRequest participant : requested) {
            User user = participant.role() == MatchParticipantRole.PLAYER
                ? (tournamentId == null
                    ? requireUser(participant.userId(), "Player")
                    : requireRegisteredPlayer(tournamentId, participant.userId(), "Player"))
                : requireUser(participant.userId(), "Official");
            participants.add(participantRepository.save(MatchParticipant.builder()
                .match(match)
                .user(user)
                .teamCode(participant.teamCode())
                .role(participant.role())
                .status(participant.role() == MatchParticipantRole.PLAYER
                    ? MatchParticipantStatus.ACCEPTED : MatchParticipantStatus.INVITED)
                .build()));
        }
        addOfficial(participants, match, request.scorerId(), MatchParticipantRole.SCORER);
        addOfficial(participants, match, request.refereeId(), MatchParticipantRole.REFEREE);
        return participants;
    }

    private List<CreateMatchRequest.ParticipantRequest> normalizedPlayers(CreateMatchRequest request) {
        if (request.participants() != null && !request.participants().isEmpty()) {
            return request.participants().stream()
                .map(participant -> new CreateMatchRequest.ParticipantRequest(
                    participant.userId(), participant.teamCode(),
                    participant.role() == null ? MatchParticipantRole.PLAYER : participant.role()))
                .toList();
        }
        if (request.player1Id() == null || request.player2Id() == null) {
            throw new BadRequestException("Provide participants or both legacy player IDs");
        }
        if (request.player1Id().equals(request.player2Id())) {
            throw new BadRequestException("Players must be different");
        }
        return List.of(
            new CreateMatchRequest.ParticipantRequest(request.player1Id(), "A", MatchParticipantRole.PLAYER),
            new CreateMatchRequest.ParticipantRequest(request.player2Id(), "B", MatchParticipantRole.PLAYER)
        );
    }

    private void addOfficial(List<MatchParticipant> participants, Match match, UUID userId, MatchParticipantRole role) {
        if (userId == null) return;
        boolean exists = participants.stream().anyMatch(participant ->
            participant.getUser().getId().equals(userId) && participant.getRole() == role);
        if (!exists) {
            participants.add(participantRepository.save(MatchParticipant.builder()
                .match(match).user(requireUser(userId, "Official")).role(role)
                .status(role == MatchParticipantRole.SCORER
                    ? MatchParticipantStatus.ACCEPTED
                    : MatchParticipantStatus.INVITED)
                .build()));
        }
    }

    private MatchResponse response(Match match) {
        return matchMapper.toResponse(match, tournamentIdForMatch(match.getId()).orElse(null),
            participantRepository.findByMatchIdOrderByCreatedAtAsc(match.getId()), requireState(match.getId()));
    }

    private LiveMatchStateResponse liveState(Match match, MatchState state) {
        return liveStateService.snapshot(match.getId(), match.getStatus(), state.getScores(), state.getSets(),
            state.getRevision(), state.getLastEventAt());
    }

    private void appendEvent(Match match, User actor, ScoreEventType type, Map<String, Object> payload, long sequence) {
        scoreEventRepository.save(ScoreEvent.builder().match(match).actor(actor).eventType(type)
            .payload(payload).sequenceNumber(sequence).build());
    }

    private long nextSequence(UUID matchId) {
        return scoreEventRepository.findTopByMatchIdOrderBySequenceNumberDesc(matchId)
            .map(event -> event.getSequenceNumber() + 1L)
            .orElse(1L);
    }

    private Map<String, Object> defaultRules(Map<String, Object> requested) {
        if (requested != null && !requested.isEmpty()) return new LinkedHashMap<>(requested);
        return new LinkedHashMap<>(Map.of(
            "pointsPerSet", 21,
            "bestOfSets", 3,
            "winByTwo", true
        ));
    }

    private Map<String, Integer> initialScores() {
        return new LinkedHashMap<>(Map.of("A", 0, "B", 0));
    }

    private MatchMode resolvedMode(CreateMatchRequest request) {
        if (request.mode() != null) {
            return request.mode();
        }
        return request.tournamentId() == null ? MatchMode.CASUAL : MatchMode.TOURNAMENT;
    }

    private String normalizeTeamCode(String teamCode) {
        if (teamCode == null || teamCode.isBlank()) {
            throw new BadRequestException("Team code is required");
        }
        return teamCode.trim().toUpperCase();
    }

    private void ensureMatchEditable(Match match) {
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new BadRequestException("Completed match cannot be edited");
        }
        if (match.getStatus() == MatchStatus.CANCELLED) {
            throw new BadRequestException("Cancelled match cannot be edited");
        }
    }

    private void requireAssignedScorekeeper(Match match) {
        UUID currentUserId = currentUserService.getUserId();
        UUID assignedScorekeeper = findAssignedScorekeeperId(match.getId())
            .orElseThrow(() -> new BadRequestException("No scorekeeper is assigned for this match"));
        if (!assignedScorekeeper.equals(currentUserId)) {
            throw new ForbiddenException("Only assigned scorekeeper can update score");
        }
    }

    private Optional<UUID> findAssignedScorekeeperId(UUID matchId) {
        return participantRepository.findFirstByMatchIdAndRoleAndStatusOrderByCreatedAtDesc(
                matchId, MatchParticipantRole.SCORER, MatchParticipantStatus.ACCEPTED)
            .map(participant -> participant.getUser().getId());
    }

    private Optional<UUID> findLatestScorekeeperId(UUID matchId) {
        List<MatchParticipant> scorers =
            participantRepository.findByMatchIdAndRoleOrderByCreatedAtDesc(matchId, MatchParticipantRole.SCORER);
        if (scorers.isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(scorers.getFirst().getUser()).map(User::getId);
    }

    private Optional<ScoreEvent> latestActivePointEvent(UUID matchId) {
        return scoreEventRepository.findByMatchIdOrderBySequenceNumberDesc(matchId).stream()
            .filter(event -> event.getEventType() == ScoreEventType.POINT_ADDED)
            .filter(event -> !Boolean.TRUE.equals(event.getPayload().get("undone")))
            .findFirst();
    }

    private Map<String, Integer> mapFromPayload(Object raw) {
        Map<String, Integer> result = new LinkedHashMap<>();
        if (!(raw instanceof Map<?, ?> rawMap)) {
            return result;
        }
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) {
                continue;
            }
            if (entry.getValue() instanceof Number number) {
                result.put(String.valueOf(entry.getKey()), number.intValue());
                continue;
            }
            try {
                result.put(String.valueOf(entry.getKey()), Integer.parseInt(String.valueOf(entry.getValue())));
            } catch (NumberFormatException ignore) {
            }
        }
        return result;
    }

    private Optional<String> determineWinningTeam(Map<String, Integer> scores, Map<String, Object> rules) {
        int scoreA = scores.getOrDefault("A", 0);
        int scoreB = scores.getOrDefault("B", 0);
        if (scoreA == scoreB) {
            return Optional.empty();
        }
        int pointsToWin = intRule(rules, List.of("pointsToWin", "pointsPerSet"), 21);
        boolean winByTwo = booleanRule(rules, List.of("winByTwo"), true);
        int maxScore = Math.max(scoreA, scoreB);
        int diff = Math.abs(scoreA - scoreB);
        if (maxScore < pointsToWin) {
            return Optional.empty();
        }
        if (winByTwo && diff < 2) {
            return Optional.empty();
        }
        return Optional.of(scoreA > scoreB ? "A" : "B");
    }

    private Optional<User> winnerForTeam(UUID matchId, String teamCode) {
        return participantRepository.findByMatchIdOrderByCreatedAtAsc(matchId).stream()
            .filter(participant -> participant.getRole() == MatchParticipantRole.PLAYER)
            .filter(participant -> teamCode.equalsIgnoreCase(participant.getTeamCode()))
            .map(MatchParticipant::getUser)
            .findFirst();
    }

    private int intRule(Map<String, Object> rules, List<String> keys, int fallback) {
        if (rules == null) {
            return fallback;
        }
        for (String key : keys) {
            Object value = rules.get(key);
            if (value instanceof Number number) {
                return number.intValue();
            }
            if (value instanceof String str && !str.isBlank()) {
                try {
                    return Integer.parseInt(str.trim());
                } catch (NumberFormatException ignore) {
                }
            }
        }
        return fallback;
    }

    private boolean booleanRule(Map<String, Object> rules, List<String> keys, boolean fallback) {
        if (rules == null) {
            return fallback;
        }
        for (String key : keys) {
            Object value = rules.get(key);
            if (value instanceof Boolean bool) {
                return bool;
            }
            if (value instanceof String str && !str.isBlank()) {
                return Boolean.parseBoolean(str.trim());
            }
        }
        return fallback;
    }

    private MatchScorecardResponse scorecard(Match match, MatchState state) {
        List<MatchParticipant> participants = participantRepository.findByMatchIdOrderByCreatedAtAsc(match.getId());
        List<MatchParticipantResponse> participantResponses = participants.stream()
            .map(participant -> new MatchParticipantResponse(
                participant.getUser().getId(), participant.getTeamCode(), participant.getRole(), participant.getStatus()))
            .toList();

        int pointsToWin = intRule(match.getRules(), List.of("pointsToWin", "pointsPerSet"), 21);
        int bestOf = intRule(match.getRules(), List.of("bestOf", "bestOfSets"), 3);
        boolean winByTwo = booleanRule(match.getRules(), List.of("winByTwo"), true);
        UUID scorekeeperId = findAssignedScorekeeperId(match.getId())
            .or(() -> findLatestScorekeeperId(match.getId()))
            .orElse(null);
        UUID tournamentId = tournamentIdForMatch(match.getId()).orElse(null);

        return new MatchScorecardResponse(
            match.getId(),
            tournamentId,
            match.getRound(),
            match.getStatus(),
            match.getVenue(),
            match.getScheduledAt(),
            participantResponses,
            new LinkedHashMap<>(state.getScores()),
            Math.max(1, state.getSets().size() + 1),
            pointsToWin,
            bestOf,
            winByTwo,
            scorekeeperId,
            match.getWinner() != null ? match.getWinner().getId() : null,
            state.getRevision(),
            state.getLastEventAt(),
            match.getCreatedAt()
        );
    }

    private User requireRegisteredPlayer(UUID tournamentId, UUID userId, String label) {
        if (!registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, userId, RegistrationStatus.REGISTERED)) {
            throw new BadRequestException(label + " must be registered in the tournament");
        }
        return requireUser(userId, label);
    }

    private User requireUser(UUID id, String label) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(label + " not found"));
    }

    private Tournament requireTournament(UUID id) {
        return tournamentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private Match requireMatch(UUID id) {
        return matchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Match not found"));
    }

    private MatchState requireState(UUID matchId) {
        return stateRepository.findByMatchId(matchId).orElseThrow(() -> new ResourceNotFoundException("Match state not found"));
    }

    private Tournament tournamentForMatch(UUID matchId) {
        return tournamentMatchRepository.findByMatchId(matchId)
            .map(TournamentMatch::getTournament)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament match link not found"));
    }

    private Optional<UUID> tournamentIdForMatch(UUID matchId) {
        return tournamentMatchRepository.findByMatchId(matchId)
            .map(TournamentMatch::getTournament)
            .map(Tournament::getId);
    }

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage matches");
        }
    }
}
