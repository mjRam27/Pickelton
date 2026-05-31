package com.pickelton.backend.match.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchParticipantStatus;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.ScoreEventType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.LiveMatchStateResponse;
import com.pickelton.backend.match.dto.MatchResponse;
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
        Tournament tournament = requireTournament(request.tournamentId());
        requireOrganizer(tournament);
        if (tournament.getStatus() == TournamentStatus.FINISHED || tournament.getStatus() == TournamentStatus.CANCELLED) {
            throw new BadRequestException("Matches cannot be created for a closed tournament");
        }
        Match match = matchRepository.save(Match.builder()
            .round(request.round().trim())
            .status(MatchStatus.SCHEDULED)
            .rules(defaultRules(request.rules()))
            .venue(request.venue())
            .scheduledAt(request.scheduledAt())
            .build());
        tournamentMatchRepository.save(TournamentMatch.builder()
            .match(match)
            .tournament(tournament)
            .displayOrder((int) tournamentMatchRepository.countByTournamentId(tournament.getId()) + 1)
            .build());
        List<MatchParticipant> participants = saveParticipants(match, request);
        OffsetDateTime now = OffsetDateTime.now();
        MatchState state = stateRepository.save(MatchState.builder()
            .match(match)
            .scores(initialScores())
            .sets(new ArrayList<>())
            .revision(0L)
            .lastEventAt(now)
            .build());
        appendEvent(match, currentUserService.getCurrentUser(), ScoreEventType.MATCH_CREATED,
            Map.of("scores", state.getScores()), 1L);
        LiveMatchStateResponse liveState = liveState(match, state);
        liveStateService.cache(liveState);
        return matchMapper.toResponse(match, tournament.getId(), participants, state);
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

    public MatchResponse updateScore(UUID id, UpdateMatchScoreRequest request) {
        Match match = requireMatch(id);
        requireScorePermission(match);
        if (match.getStatus() == MatchStatus.CANCELLED) {
            throw new BadRequestException("Cancelled match cannot be scored");
        }
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
            Map.of("oldScores", oldScores, "scores", state.getScores()), state.getRevision());
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
        liveStateService.cacheAndPublish(liveState(saved, requireState(id)));
        return response(saved);
    }

    private List<MatchParticipant> saveParticipants(Match match, CreateMatchRequest request) {
        List<CreateMatchRequest.ParticipantRequest> requested = normalizedPlayers(request);
        if (requested.stream().filter(participant -> participant.role() == MatchParticipantRole.PLAYER).count() < 2) {
            throw new BadRequestException("At least two players are required");
        }
        List<MatchParticipant> participants = new ArrayList<>();
        for (CreateMatchRequest.ParticipantRequest participant : requested) {
            User user = participant.role() == MatchParticipantRole.PLAYER
                ? requireRegisteredPlayer(tournamentForMatch(match.getId()).getId(), participant.userId(), "Player")
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
                .status(MatchParticipantStatus.INVITED).build()));
        }
    }

    private void requireScorePermission(Match match) {
        Tournament tournament = tournamentForMatch(match.getId());
        UUID userId = currentUserService.getUserId();
        if (tournament.getCreatedBy().getId().equals(userId)) return;
        boolean official = participantRepository.existsByMatchIdAndUserIdAndRoleInAndStatus(
            match.getId(), userId, List.of(MatchParticipantRole.SCORER, MatchParticipantRole.REFEREE),
            MatchParticipantStatus.ACCEPTED);
        if (!official) throw new ForbiddenException("Scorer or referee permission is required");
    }

    private MatchResponse response(Match match) {
        return matchMapper.toResponse(match, tournamentForMatch(match.getId()).getId(),
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

    private Map<String, Object> defaultRules(Map<String, Object> requested) {
        if (requested != null && !requested.isEmpty()) return new LinkedHashMap<>(requested);
        return new LinkedHashMap<>(Map.of("pointsPerSet", 21, "bestOfSets", 3));
    }

    private Map<String, Integer> initialScores() {
        return new LinkedHashMap<>(Map.of("A", 0, "B", 0));
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

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage matches");
        }
    }
}
