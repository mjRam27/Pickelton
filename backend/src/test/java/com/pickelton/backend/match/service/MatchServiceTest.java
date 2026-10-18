package com.pickelton.backend.match.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchParticipantStatus;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.ScoreEventType;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.AddPointRequest;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.ManualScoreCorrectionRequest;
import com.pickelton.backend.match.dto.MatchResponse;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;
    @Mock
    private MatchParticipantRepository participantRepository;
    @Mock
    private MatchStateRepository stateRepository;
    @Mock
    private ScoreEventRepository scoreEventRepository;
    @Mock
    private TournamentMatchRepository tournamentMatchRepository;
    @Mock
    private TournamentRepository tournamentRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private LiveMatchStateService liveStateService;
    @Mock
    private ScoreBroadcastService scoreBroadcastService;
    @Mock
    private MatchMapper matchMapper;

    private MatchService matchService;

    private UUID matchId;
    private UUID tournamentId;
    private UUID scorekeeperId;
    private UUID otherUserId;
    private User scorekeeper;
    private Match match;
    private MatchState state;
    private MatchParticipant scorekeeperParticipant;
    private MatchParticipant playerA;
    private MatchParticipant playerB;

    @BeforeEach
    void setUp() {
        matchService = new MatchService(
            matchRepository,
            participantRepository,
            stateRepository,
            scoreEventRepository,
            tournamentMatchRepository,
            tournamentRepository,
            registrationRepository,
            userRepository,
            currentUserService,
            liveStateService,
            scoreBroadcastService,
            matchMapper
        );

        matchId = UUID.randomUUID();
        tournamentId = UUID.randomUUID();
        scorekeeperId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        scorekeeper = new User();
        scorekeeper.setId(scorekeeperId);
        scorekeeper.setName("Scorekeeper");
        scorekeeper.setEmail("scorekeeper@example.com");
        scorekeeper.setPhoneNumber("+11111111111");

        User playerAUser = new User();
        playerAUser.setId(UUID.randomUUID());
        playerAUser.setName("Player A");
        playerAUser.setEmail("a@example.com");
        playerAUser.setPhoneNumber("+12222222222");

        User playerBUser = new User();
        playerBUser.setId(UUID.randomUUID());
        playerBUser.setName("Player B");
        playerBUser.setEmail("b@example.com");
        playerBUser.setPhoneNumber("+13333333333");

        match = Match.builder()
            .round("Round 1")
            .status(MatchStatus.SCHEDULED)
            .rules(new LinkedHashMap<>(Map.of("pointsToWin", 11, "bestOf", 3, "winByTwo", false)))
            .build();
        match.setId(matchId);
        match.setCreatedAt(OffsetDateTime.now());
        match.setUpdatedAt(OffsetDateTime.now());

        state = MatchState.builder()
            .match(match)
            .scores(new LinkedHashMap<>(Map.of("A", 0, "B", 0)))
            .sets(List.of())
            .revision(0L)
            .lastEventAt(OffsetDateTime.now())
            .build();

        scorekeeperParticipant = MatchParticipant.builder()
            .match(match)
            .user(scorekeeper)
            .role(MatchParticipantRole.SCORER)
            .status(MatchParticipantStatus.ACCEPTED)
            .build();

        playerA = MatchParticipant.builder()
            .match(match)
            .user(playerAUser)
            .teamCode("A")
            .role(MatchParticipantRole.PLAYER)
            .status(MatchParticipantStatus.ACCEPTED)
            .build();
        playerB = MatchParticipant.builder()
            .match(match)
            .user(playerBUser)
            .teamCode("B")
            .role(MatchParticipantRole.PLAYER)
            .status(MatchParticipantStatus.ACCEPTED)
            .build();

        Tournament tournament = Tournament.builder().build();
        tournament.setId(tournamentId);

        TournamentMatch tournamentMatch = TournamentMatch.builder()
            .match(match)
            .tournament(tournament)
            .displayOrder(1)
            .build();

        when(matchRepository.findById(matchId)).thenReturn(Optional.of(match));
        when(stateRepository.findByMatchId(matchId)).thenReturn(Optional.of(state));
        when(participantRepository.findFirstByMatchIdAndRoleAndStatusOrderByCreatedAtDesc(
            matchId, MatchParticipantRole.SCORER, MatchParticipantStatus.ACCEPTED))
            .thenReturn(Optional.of(scorekeeperParticipant));
        when(participantRepository.findByMatchIdAndRoleOrderByCreatedAtDesc(matchId, MatchParticipantRole.SCORER))
            .thenReturn(List.of(scorekeeperParticipant));
        when(participantRepository.findByMatchIdOrderByCreatedAtAsc(matchId))
            .thenReturn(List.of(playerA, playerB, scorekeeperParticipant));
        when(tournamentMatchRepository.findByMatchId(matchId)).thenReturn(Optional.of(tournamentMatch));

        when(matchRepository.save(any(Match.class))).thenAnswer(invocation -> {
            Match saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });
        when(stateRepository.save(any(MatchState.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(scoreEventRepository.save(any(ScoreEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(participantRepository.save(any(MatchParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(scoreEventRepository.findTopByMatchIdOrderBySequenceNumberDesc(any(UUID.class))).thenReturn(Optional.empty());
    }

    @Test
    void onlyScorekeeperCanUpdatePoint() {
        when(currentUserService.getUserId()).thenReturn(scorekeeperId);
        when(currentUserService.getCurrentUser()).thenReturn(scorekeeper);

        matchService.addPoint(matchId, new AddPointRequest("A"));

        assertEquals(1, state.getScores().get("A"));
        assertEquals(0, state.getScores().get("B"));
        verify(stateRepository).save(state);
        verify(scoreBroadcastService).broadcastScoreUpdate(any(UUID.class), any());
    }

    @Test
    void nonScorekeeperIsBlockedFromUpdatingPoint() {
        when(currentUserService.getUserId()).thenReturn(otherUserId);

        assertThrows(ForbiddenException.class, () -> matchService.addPoint(matchId, new AddPointRequest("A")));
        verify(stateRepository, never()).save(any(MatchState.class));
    }

    @Test
    void completedMatchCannotBeEdited() {
        when(currentUserService.getUserId()).thenReturn(scorekeeperId);
        match.setStatus(MatchStatus.COMPLETED);

        assertThrows(BadRequestException.class, () -> matchService.addPoint(matchId, new AddPointRequest("A")));
        verify(stateRepository, never()).save(any(MatchState.class));
    }

    @Test
    void undoLastEventRestoresPreviousScore() {
        when(currentUserService.getUserId()).thenReturn(scorekeeperId);
        when(currentUserService.getCurrentUser()).thenReturn(scorekeeper);
        state.setScores(new LinkedHashMap<>(Map.of("A", 3, "B", 2)));
        state.setRevision(4L);

        ScoreEvent lastPointEvent = ScoreEvent.builder()
            .match(match)
            .actor(scorekeeper)
            .eventType(ScoreEventType.POINT_ADDED)
            .payload(new LinkedHashMap<>(Map.of(
                "teamCode", "A",
                "beforeScores", new LinkedHashMap<>(Map.of("A", 2, "B", 2)),
                "afterScores", new LinkedHashMap<>(Map.of("A", 3, "B", 2)),
                "undone", false
            )))
            .sequenceNumber(5L)
            .build();
        lastPointEvent.setId(UUID.randomUUID());

        when(scoreEventRepository.findByMatchIdOrderBySequenceNumberDesc(matchId)).thenReturn(List.of(lastPointEvent));
        when(scoreEventRepository.findTopByMatchIdOrderBySequenceNumberDesc(matchId)).thenReturn(Optional.of(lastPointEvent));

        matchService.undoLastScore(matchId);

        assertEquals(2, state.getScores().get("A"));
        assertEquals(2, state.getScores().get("B"));
        assertTrue(Boolean.TRUE.equals(lastPointEvent.getPayload().get("undone")));
        verify(scoreEventRepository).save(lastPointEvent);
    }

    @Test
    void manualCorrectionUpdatesScoreAndStoresEvent() {
        when(currentUserService.getUserId()).thenReturn(scorekeeperId);
        when(currentUserService.getCurrentUser()).thenReturn(scorekeeper);

        matchService.manualCorrection(matchId, new ManualScoreCorrectionRequest(7, 5, "Fix input mistake"));

        assertEquals(7, state.getScores().get("A"));
        assertEquals(5, state.getScores().get("B"));
        verify(scoreEventRepository).save(any(ScoreEvent.class));
    }

    @Test
    void completeMatchLocksFurtherEditing() {
        when(currentUserService.getUserId()).thenReturn(scorekeeperId);
        when(currentUserService.getCurrentUser()).thenReturn(scorekeeper);
        state.setScores(new LinkedHashMap<>(Map.of("A", 11, "B", 9)));
        when(scoreEventRepository.findTopByMatchIdOrderBySequenceNumberDesc(matchId)).thenReturn(Optional.empty());

        matchService.completeMatch(matchId);

        assertEquals(MatchStatus.COMPLETED, match.getStatus());
        assertThrows(BadRequestException.class, () -> matchService.addPoint(matchId, new AddPointRequest("A")));
    }

    @Test
    void casualMatchCanBeCreatedWithoutTournamentIdAndRound() {
        when(currentUserService.getCurrentUser()).thenReturn(scorekeeper);

        User casualPlayerA = new User();
        casualPlayerA.setId(UUID.randomUUID());
        User casualPlayerB = new User();
        casualPlayerB.setId(UUID.randomUUID());
        when(userRepository.findById(casualPlayerA.getId())).thenReturn(Optional.of(casualPlayerA));
        when(userRepository.findById(casualPlayerB.getId())).thenReturn(Optional.of(casualPlayerB));

        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.CASUAL,
            null,
            null,
            null,
            List.of(
                new CreateMatchRequest.ParticipantRequest(casualPlayerA.getId(), "A", MatchParticipantRole.PLAYER),
                new CreateMatchRequest.ParticipantRequest(casualPlayerB.getId(), "B", MatchParticipantRole.PLAYER)
            ),
            null,
            null,
            Map.of("pointsToWin", 11),
            "Court 2",
            OffsetDateTime.now().plusDays(1),
            null
        );

        MatchResponse mapped = new MatchResponse(
            UUID.randomUUID(), null, casualPlayerA.getId(), casualPlayerB.getId(),
            0, 0, null, "Friendly Match", MatchStatus.SCHEDULED, List.of(),
            Map.of("pointsToWin", 11), "Court 2", request.scheduledAt(), List.of(), 0L,
            OffsetDateTime.now(), OffsetDateTime.now()
        );
        when(matchMapper.toResponse(any(Match.class), any(), any(), any())).thenReturn(mapped);

        MatchResponse response = matchService.createMatch(request);

        assertEquals("Friendly Match", response.round());
        assertEquals(null, response.tournamentId());
        verify(tournamentMatchRepository, never()).save(any(TournamentMatch.class));
        verify(stateRepository).save(any(MatchState.class));
    }

    @Test
    void tournamentMatchStillRequiresTournamentId() {
        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.TOURNAMENT,
            null,
            null,
            null,
            List.of(),
            null,
            null,
            Map.of(),
            null,
            null,
            "Round 1"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> matchService.createMatch(request));
        assertEquals("Tournament is required for tournament matches", ex.getMessage());
    }

    @Test
    void casualMatchInitializesScorecardState() {
        when(currentUserService.getCurrentUser()).thenReturn(scorekeeper);

        User casualPlayerA = new User();
        casualPlayerA.setId(UUID.randomUUID());
        User casualPlayerB = new User();
        casualPlayerB.setId(UUID.randomUUID());
        when(userRepository.findById(casualPlayerA.getId())).thenReturn(Optional.of(casualPlayerA));
        when(userRepository.findById(casualPlayerB.getId())).thenReturn(Optional.of(casualPlayerB));
        when(matchMapper.toResponse(any(Match.class), any(), any(), any())).thenReturn(new MatchResponse(
            UUID.randomUUID(), null, casualPlayerA.getId(), casualPlayerB.getId(),
            0, 0, null, "Friendly Match", MatchStatus.SCHEDULED, List.of(),
            Map.of(), null, null, List.of(), 0L, OffsetDateTime.now(), OffsetDateTime.now()
        ));

        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.CASUAL,
            null,
            null,
            null,
            List.of(
                new CreateMatchRequest.ParticipantRequest(casualPlayerA.getId(), "A", MatchParticipantRole.PLAYER),
                new CreateMatchRequest.ParticipantRequest(casualPlayerB.getId(), "B", MatchParticipantRole.PLAYER)
            ),
            null,
            null,
            null,
            null,
            null,
            null
        );

        matchService.createMatch(request);

        verify(stateRepository).save(any(MatchState.class));
        verify(liveStateService).cache(any());
    }
}
