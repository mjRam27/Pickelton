package com.pickelton.backend.match.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.MatchType;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.ScoreEventType;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.AcceptInviteRequest;
import com.pickelton.backend.match.dto.AddPointRequest;
import com.pickelton.backend.match.dto.AssignScorekeeperRequest;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.InviteParticipantRequest;
import com.pickelton.backend.match.dto.LiveScoreResponse;
import com.pickelton.backend.match.dto.ManualScoreCorrectionRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.MatchScorecardResponse;
import com.pickelton.backend.match.dto.ScorePointRequest;
import com.pickelton.backend.match.dto.ScorekeeperSearchResponse;
import com.pickelton.backend.match.dto.UndoScoreRequest;
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
    private final MatchStateRepository matchStateRepository;
    private final ScoreEventRepository scoreEventRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final LiveMatchStateService liveMatchStateService;
    private final ScoreBroadcastService scoreBroadcastService;
    private final MatchMapper matchMapper;

    public MatchResponse createMatch(CreateMatchRequest request) {
        MatchMode mode = request.mode() != null ? request.mode() : MatchMode.TOURNAMENT;
        Tournament tournament = null;
        if (mode == MatchMode.TOURNAMENT) {
            if (request.tournamentId() == null) {
                throw new BadRequestException("Tournament is required for tournament matches");
            }
            tournament = requireTournament(request.tournamentId());
            requireOrganizer(tournament);
            if (tournament.getStatus() == TournamentStatus.FINISHED || tournament.getStatus() == TournamentStatus.CANCELLED) {
                throw new BadRequestException("Matches cannot be created for a closed tournament");
            }
        }

        Match match = Match.builder()
            .createdBy(currentUserService.getCurrentUser())
            .sport(request.sport() != null ? request.sport() : sportForMatch(tournament != null ? tournament.getSportType() : SportType.PICKLEBALL))
            .matchType(request.matchType() != null ? request.matchType() : MatchType.SINGLES)
            .round(request.round().trim())
            .status(MatchStatus.CREATED)
            .scheduledAt(request.scheduledAt())
            .location(clean(request.location()))
            .rules(request.rules() != null ? new LinkedHashMap<>(request.rules()) : defaultRules())
            .build();
        match = matchRepository.save(match);

        if (mode == MatchMode.TOURNAMENT) {
            tournamentMatchRepository.save(TournamentMatch.builder()
                .tournament(tournament)
                .match(match)
                .round(match.getRound())
                .build());
        }

        List<ParticipantDraft> drafts = participantDrafts(request);
        for (ParticipantDraft draft : drafts) {
            User user = mode == MatchMode.TOURNAMENT && draft.role() == ParticipantRole.PLAYER
                ? requireRegisteredPlayer(tournament.getId(), draft.userId(), "Player")
                : requireUser(draft.userId(), "Participant");
            participantRepository.save(MatchParticipant.builder()
                .match(match)
                .user(user)
                .team(draft.team())
                .role(draft.role())
                .invitationStatus(draft.role() == ParticipantRole.PLAYER ? InvitationStatus.ACCEPTED : InvitationStatus.INVITED)
                .build());
        }

        MatchState state = matchStateRepository.save(initialState(match));
        LiveScoreResponse live = toLiveResponse(match, state);
        liveMatchStateService.cache(live);
        return toResponse(match, state);
    }

    public MatchResponse inviteParticipant(UUID matchId, InviteParticipantRequest request) {
        Match match = requireMatch(matchId);
        requireMatchOwner(match);
        User user = requireUser(request.userId(), "Invitee");
        MatchParticipant participant = participantRepository.save(MatchParticipant.builder()
            .match(match)
            .user(user)
            .team(clean(request.team()))
            .role(request.role())
            .invitationStatus(InvitationStatus.INVITED)
            .build());
        match.setStatus(MatchStatus.INVITED);
        matchRepository.save(match);
        return toResponse(match, requireState(match.getId()));
    }

    public MatchResponse acceptInvite(UUID matchId, AcceptInviteRequest request) {
        UUID userId = request.userId() != null ? request.userId() : currentUserService.getUserId();
        MatchParticipant participant = participantRepository.findByMatchIdOrderByCreatedAtAsc(matchId).stream()
            .filter(candidate -> candidate.getUser().getId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));
        participant.setInvitationStatus(InvitationStatus.ACCEPTED);
        participantRepository.save(participant);
        Match match = participant.getMatch();
        match.setStatus(MatchStatus.ACCEPTED);
        matchRepository.save(match);
        return toResponse(match, requireState(matchId));
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatch(UUID id) {
        return toResponse(requireMatch(id), requireState(id));
    }

    @Transactional(readOnly = true)
    public LiveScoreResponse getLiveScore(UUID id) {
        return liveMatchStateService.get(id)
            .orElseGet(() -> {
                Match match = requireMatch(id);
                LiveScoreResponse response = toLiveResponse(match, requireState(id));
                liveMatchStateService.cache(response);
                return response;
            });
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getTournamentMatches(UUID tournamentId) {
        requireTournament(tournamentId);
        return tournamentMatchRepository.findByTournamentIdOrderByCreatedAtAsc(tournamentId).stream()
            .map(tournamentMatch -> toResponse(tournamentMatch.getMatch(), requireState(tournamentMatch.getMatch().getId())))
            .toList();
    }

    public MatchResponse scorePoint(UUID id, ScorePointRequest request) {
        Match match = requireMatch(id);
        requireScoringPermission(match);
        MatchState state = requireState(id);
        String team = normalizeTeam(request.team());
        int points = request.points() != null ? request.points() : 1;
        int oldScore = scoreForTeam(state, team);
        int newScore = oldScore + points;
        state.getCurrentScore().put(team, newScore);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("team", team);
        payload.put("oldScore", oldScore);
        payload.put("newScore", newScore);
        payload.put("delta", points);
        if (match.getStatus() == MatchStatus.CREATED || match.getStatus() == MatchStatus.ACCEPTED || match.getStatus() == MatchStatus.SCHEDULED) {
            match.setStatus(MatchStatus.LIVE);
        }
        appendEvent(match, state, ScoreEventType.POINT, payload);
        matchRepository.save(match);
        publish(match, state);
        return toResponse(match, state);
    }

    @Transactional(readOnly = true)
    public List<ScorekeeperSearchResponse> searchScorekeepers(UUID tournamentId, String query) {
        requireTournament(tournamentId);
        // TODO: Implement tournament-aware scorekeeper search.
        return List.of();
    }

    public MatchResponse assignScorekeeper(UUID matchId, AssignScorekeeperRequest request) {
        Match match = requireMatch(matchId);
        requireOrganizer(tournamentForMatch(matchId));
        User scorekeeper = requireUser(request.userId(), "Scorekeeper");

        List<MatchParticipant> scorers =
            participantRepository.findByMatchIdAndRole(matchId, ParticipantRole.SCORER);
        MatchParticipant selected = null;
        for (MatchParticipant scorer : scorers) {
            if (scorer.getUser().getId().equals(scorekeeper.getId())) {
                scorer.setInvitationStatus(InvitationStatus.ACCEPTED);
                selected = participantRepository.save(scorer);
            } else if (scorer.getInvitationStatus() != InvitationStatus.DECLINED) {
                scorer.setInvitationStatus(InvitationStatus.DECLINED);
                participantRepository.save(scorer);
            }
        }

        if (selected == null) {
            selected = participantRepository.save(MatchParticipant.builder()
                .match(match)
                .user(scorekeeper)
                .role(ParticipantRole.SCORER)
                .invitationStatus(InvitationStatus.ACCEPTED)
                .build());
        }

        return toResponse(match, requireState(matchId));
    }

    @Transactional(readOnly = true)
    public MatchScorecardResponse getScorecard(UUID id) {
        Match match = requireMatch(id);
        return toScorecardResponse(match, requireState(id));
    }

    public MatchScorecardResponse addPoint(UUID id, AddPointRequest request) {
        // TODO: Replace this adapter with full scorecard point logic.
        MatchResponse response = scorePoint(id, new ScorePointRequest(request.teamCode(), 1));
        return toScorecardResponse(requireMatch(response.id()), requireState(response.id()));
    }

    public MatchScorecardResponse undoLastScore(UUID id) {
        // TODO: Replace this adapter with full scorecard undo logic.
        MatchResponse response = undoLastPoint(id, new UndoScoreRequest(null));
        return toScorecardResponse(requireMatch(response.id()), requireState(response.id()));
    }

    public MatchScorecardResponse manualCorrection(UUID id, ManualScoreCorrectionRequest request) {
        // TODO: Replace this adapter with full scorecard correction logic.
        MatchResponse response = updateScore(id, new UpdateMatchScoreRequest(request.scoreA(), request.scoreB(), null, null));
        return toScorecardResponse(requireMatch(response.id()), requireState(response.id()));
    }

    public MatchScorecardResponse completeMatch(UUID id) {
        // TODO: Replace this adapter with full scorecard completion logic.
        MatchResponse response = endMatch(id);
        return toScorecardResponse(requireMatch(response.id()), requireState(response.id()));
    }

    public MatchResponse updateScore(UUID id, UpdateMatchScoreRequest request) {
        Match match = requireMatch(id);
        requireScoringPermission(match);
        MatchState state = requireState(id);
        if (request.team() != null && !request.team().isBlank()) {
            return scorePoint(id, new ScorePointRequest(request.team(), request.delta() != null ? request.delta() : 1));
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("oldScore", new LinkedHashMap<>(state.getCurrentScore()));
        state.getCurrentScore().put("A", request.score1());
        state.getCurrentScore().put("B", request.score2());
        payload.put("newScore", new LinkedHashMap<>(state.getCurrentScore()));
        match.setStatus(MatchStatus.COMPLETED);
        match.setWinner(resolveWinner(match.getId(), request.score1(), request.score2()));
        appendEvent(match, state, ScoreEventType.POINT, payload);
        matchRepository.save(match);
        publish(match, state);
        return toResponse(match, state);
    }

    public MatchResponse undoLastPoint(UUID id, UndoScoreRequest request) {
        Match match = requireMatch(id);
        requireScoringPermission(match);
        MatchState state = requireState(id);
        List<ScoreEvent> events = scoreEventRepository.findByMatchIdOrderBySequenceNumberAsc(id);
        Set<String> undoneEventIds = new HashSet<>();
        events.stream()
            .filter(event -> event.getEventType() == ScoreEventType.UNDO)
            .map(event -> event.getPayload().get("undoneEventId"))
            .filter(value -> value != null)
            .map(String::valueOf)
            .forEach(undoneEventIds::add);
        ScoreEvent lastPoint = events.stream()
            .filter(event -> event.getEventType() == ScoreEventType.POINT)
            .filter(event -> !undoneEventIds.contains(event.getId().toString()))
            .reduce((first, second) -> second)
            .orElseThrow(() -> new BadRequestException("No point event to undo"));
        String team = String.valueOf(lastPoint.getPayload().getOrDefault("team", ""));
        int delta = intValue(lastPoint.getPayload().get("delta"), 1);
        if (team.isBlank()) {
            throw new BadRequestException("Last point event cannot be automatically undone");
        }
        int oldScore = scoreForTeam(state, team);
        int newScore = Math.max(0, oldScore - delta);
        state.getCurrentScore().put(team, newScore);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("undoneEventId", lastPoint.getId());
        payload.put("team", team);
        payload.put("oldScore", oldScore);
        payload.put("newScore", newScore);
        payload.put("reason", request != null ? request.reason() : null);
        appendEvent(match, state, ScoreEventType.UNDO, payload);
        publish(match, state);
        return toResponse(match, state);
    }

    public MatchResponse endSet(UUID id) {
        Match match = requireMatch(id);
        requireScoringPermission(match);
        MatchState state = requireState(id);
        Map<String, Object> set = new LinkedHashMap<>();
        set.put("set", state.getCurrentSet());
        set.put("score", new LinkedHashMap<>(state.getCurrentScore()));
        state.getSetSummary().add(set);
        state.setCurrentSet(state.getCurrentSet() + 1);
        state.setCurrentScore(new LinkedHashMap<>(Map.of("A", 0, "B", 0)));
        appendEvent(match, state, ScoreEventType.END_SET, set);
        publish(match, state);
        return toResponse(match, state);
    }

    public MatchResponse endMatch(UUID id) {
        Match match = requireMatch(id);
        requireScoringPermission(match);
        MatchState state = requireState(id);
        match.setStatus(MatchStatus.COMPLETED);
        match.setWinner(resolveWinner(match.getId(), scoreForTeam(state, "A"), scoreForTeam(state, "B")));
        appendEvent(match, state, ScoreEventType.END_MATCH, Map.of("finalScore", new LinkedHashMap<>(state.getCurrentScore())));
        matchRepository.save(match);
        publish(match, state);
        return toResponse(match, state);
    }

    public MatchResponse cancelMatch(UUID id) {
        Match match = requireMatch(id);
        requireMatchOwner(match);
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new BadRequestException("Completed match cannot be cancelled");
        }
        match.setStatus(MatchStatus.CANCELLED);
        MatchState state = requireState(id);
        state.getLiveState().put("status", match.getStatus().name());
        matchStateRepository.save(state);
        matchRepository.save(match);
        publish(match, state);
        return toResponse(match, state);
    }

    private List<ParticipantDraft> participantDrafts(CreateMatchRequest request) {
        List<ParticipantDraft> drafts = new ArrayList<>();
        if (request.participants() != null && !request.participants().isEmpty()) {
            request.participants().forEach(participant -> drafts.add(new ParticipantDraft(
                participant.userId(), normalizeTeam(participant.team()), participant.role())));
        } else {
            if (request.player1Id() == null || request.player2Id() == null) {
                throw new BadRequestException("Either participants or legacy player1Id/player2Id are required");
            }
            drafts.add(new ParticipantDraft(request.player1Id(), "A", ParticipantRole.PLAYER));
            drafts.add(new ParticipantDraft(request.player2Id(), "B", ParticipantRole.PLAYER));
        }
        if (request.scorerId() != null) {
            drafts.add(new ParticipantDraft(request.scorerId(), null, ParticipantRole.SCORER));
        }
        if (request.refereeId() != null) {
            drafts.add(new ParticipantDraft(request.refereeId(), null, ParticipantRole.REFEREE));
        }
        return drafts;
    }

    private MatchState initialState(Match match) {
        return MatchState.builder()
            .match(match)
            .currentScore(new LinkedHashMap<>(Map.of("A", 0, "B", 0)))
            .currentSet(1)
            .setSummary(new ArrayList<>())
            .liveState(new LinkedHashMap<>(Map.of("status", match.getStatus().name())))
            .revision(0L)
            .lastEventAt(OffsetDateTime.now())
            .build();
    }

    private void appendEvent(Match match, MatchState state, ScoreEventType eventType, Map<String, Object> payload) {
        long sequence = state.getRevision() + 1;
        User actor = currentUserService.getCurrentUser();
        scoreEventRepository.save(ScoreEvent.builder()
            .match(match)
            .actor(actor)
            .eventType(eventType)
            .payload(payload)
            .sequenceNumber(sequence)
            .build());
        state.setRevision(sequence);
        state.setLastEventAt(OffsetDateTime.now());
        state.getLiveState().put("status", match.getStatus().name());
        matchStateRepository.save(state);
    }

    private void publish(Match match, MatchState state) {
        LiveScoreResponse live = toLiveResponse(match, state);
        liveMatchStateService.cacheAndPublish(live);
        scoreBroadcastService.broadcastScoreUpdate(match.getId(), live);
    }

    private MatchResponse toResponse(Match match, MatchState state) {
        UUID tournamentId = tournamentMatchRepository.findByMatchId(match.getId())
            .map(link -> link.getTournament().getId())
            .orElse(null);
        List<MatchParticipant> participants = participantRepository.findByMatchIdOrderByCreatedAtAsc(match.getId());
        return matchMapper.toResponse(match, tournamentId, participants, state);
    }

    private MatchScorecardResponse toScorecardResponse(Match match, MatchState state) {
        UUID tournamentId = tournamentMatchRepository.findByMatchId(match.getId())
            .map(link -> link.getTournament().getId())
            .orElse(null);
        List<MatchParticipant> participants = participantRepository.findByMatchIdOrderByCreatedAtAsc(match.getId());
        UUID scorekeeperId = participants.stream()
            .filter(participant -> participant.getRole() == ParticipantRole.SCORER)
            .filter(participant -> participant.getInvitationStatus() == InvitationStatus.ACCEPTED)
            .map(participant -> participant.getUser().getId())
            .findFirst()
            .orElse(null);
        Map<String, Integer> scores = new LinkedHashMap<>();
        scores.put("A", scoreForTeam(state, "A"));
        scores.put("B", scoreForTeam(state, "B"));
        return new MatchScorecardResponse(
            match.getId(),
            tournamentId,
            match.getRound(),
            match.getStatus(),
            match.getLocation(),
            match.getScheduledAt(),
            participants.stream().map(this::toParticipantResponse).toList(),
            scores,
            state.getCurrentSet(),
            intValue(match.getRules().get("pointsPerSet"), 21),
            intValue(match.getRules().get("bestOfSets"), 3),
            booleanValue(match.getRules().get("winByTwo"), true),
            scorekeeperId,
            match.getWinner() != null ? match.getWinner().getId() : null,
            state.getRevision(),
            state.getLastEventAt(),
            match.getCreatedAt()
        );
    }

    private com.pickelton.backend.match.dto.MatchParticipantResponse toParticipantResponse(MatchParticipant participant) {
        return new com.pickelton.backend.match.dto.MatchParticipantResponse(
            participant.getId(),
            participant.getUser().getId(),
            participant.getUser().getName(),
            participant.getTeam(),
            participant.getRole(),
            participant.getInvitationStatus()
        );
    }

    private LiveScoreResponse toLiveResponse(Match match, MatchState state) {
        return new LiveScoreResponse(
            match.getId(),
            match.getStatus(),
            state.getCurrentScore(),
            state.getCurrentSet(),
            state.getSetSummary(),
            state.getLiveState(),
            state.getRevision(),
            state.getLastEventAt()
        );
    }

    private User resolveWinner(UUID matchId, int scoreA, int scoreB) {
        if (scoreA == scoreB) {
            return null;
        }
        String winningTeam = scoreA > scoreB ? "A" : "B";
        return participantRepository.findByMatchIdAndRole(matchId, ParticipantRole.PLAYER).stream()
            .filter(participant -> winningTeam.equalsIgnoreCase(participant.getTeam()))
            .map(MatchParticipant::getUser)
            .findFirst()
            .orElse(null);
    }

    private int scoreForTeam(MatchState state, String team) {
        return intValue(state.getCurrentScore().get(team), 0);
    }

    private int intValue(Object value, int fallback) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            return Integer.parseInt(text);
        }
        return fallback;
    }

    private boolean booleanValue(Object value, boolean fallback) {
        if (value instanceof Boolean flag) {
            return flag;
        }
        if (value instanceof String text) {
            return Boolean.parseBoolean(text);
        }
        return fallback;
    }

    private void requireScoringPermission(Match match) {
        UUID userId = currentUserService.getUserId();
        if (match.getCreatedBy().getId().equals(userId)) {
            return;
        }
        boolean authorized = participantRepository.existsByMatchIdAndUserIdAndRoleInAndInvitationStatus(match.getId(), userId,
            List.of(ParticipantRole.SCORER, ParticipantRole.REFEREE), InvitationStatus.ACCEPTED);
        if (!authorized) {
            throw new ForbiddenException("Only accepted scorer or referee can update the score");
        }
    }

    private User requireRegisteredPlayer(UUID tournamentId, UUID userId, String label) {
        if (!registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, userId, RegistrationStatus.REGISTERED)) {
            throw new BadRequestException(label + " must be registered in the tournament");
        }
        return requireUser(userId, label);
    }

    private User requireUser(UUID id, String label) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(label + " not found"));
    }

    private Tournament requireTournament(UUID id) {
        return tournamentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private Tournament tournamentForMatch(UUID matchId) {
        return tournamentMatchRepository.findByMatchId(matchId)
            .map(TournamentMatch::getTournament)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament match not found"));
    }

    private Match requireMatch(UUID id) {
        return matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
    }

    private MatchState requireState(UUID matchId) {
        return matchStateRepository.findByMatchId(matchId)
            .orElseThrow(() -> new ResourceNotFoundException("Match state not found"));
    }

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage matches");
        }
    }

    private void requireMatchOwner(Match match) {
        if (!match.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the match creator can manage invites");
        }
    }

    private SportType sportForMatch(SportType sportType) {
        return sportType == SportType.BOTH ? SportType.PICKLEBALL : sportType;
    }

    private Map<String, Object> defaultRules() {
        return new LinkedHashMap<>(Map.of("pointsPerSet", 21, "bestOfSets", 3));
    }

    private String normalizeTeam(String team) {
        if (team == null || team.isBlank()) {
            return null;
        }
        return team.trim().toUpperCase();
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private record ParticipantDraft(UUID userId, String team, ParticipantRole role) {
    }
}
