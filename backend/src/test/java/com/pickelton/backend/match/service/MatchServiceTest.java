package com.pickelton.backend.match.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.GameType;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.enums.TournamentType;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.CreateMatchTeamRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchTeam;
import com.pickelton.backend.match.entity.MatchTeamPlayer;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.match.repository.MatchTeamPlayerRepository;
import com.pickelton.backend.match.repository.MatchTeamRepository;
import com.pickelton.backend.match.repository.ScoreHistoryRepository;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;
    @Mock
    private MatchTeamRepository matchTeamRepository;
    @Mock
    private MatchTeamPlayerRepository matchTeamPlayerRepository;
    @Mock
    private ScoreHistoryRepository scoreHistoryRepository;
    @Mock
    private TournamentRepository tournamentRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    @Mock
    private ValueOperations<String, Object> valueOperations;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private ScoreBroadcastService scoreBroadcastService;

    private MatchService matchService;

    @BeforeEach
    void setUp() {
        matchService = new MatchService(
            matchRepository,
            matchTeamRepository,
            matchTeamPlayerRepository,
            scoreHistoryRepository,
            tournamentRepository,
            registrationRepository,
            userRepository,
            redisTemplate,
            currentUserService,
            scoreBroadcastService,
            new MatchMapper()
        );
    }

    @Test
    void createTournamentSinglesMatchShouldPersistAndCacheSummary() {
        UUID organizerId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        UUID player1Id = UUID.randomUUID();
        UUID player2Id = UUID.randomUUID();

        User organizer = user(organizerId, "Organizer");
        Tournament tournament = tournament(tournamentId, organizer, TournamentType.SINGLES);
        User player1 = user(player1Id, "Player 1");
        User player2 = user(player2Id, "Player 2");

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(currentUserService.getUserId()).thenReturn(organizerId);
        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));
        when(userRepository.findAllById(any())).thenReturn(List.of(player1, player2));
        when(userRepository.findById(player1Id)).thenReturn(Optional.of(player1));
        when(userRepository.findById(player2Id)).thenReturn(Optional.of(player2));
        when(registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, player1Id, RegistrationStatus.REGISTERED)).thenReturn(true);
        when(registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, player2Id, RegistrationStatus.REGISTERED)).thenReturn(true);

        when(matchRepository.save(any(Match.class))).thenAnswer(invocation -> {
            Match match = invocation.getArgument(0);
            match.setId(UUID.randomUUID());
            return match;
        });
        when(matchTeamRepository.save(any(MatchTeam.class))).thenAnswer(invocation -> {
            MatchTeam team = invocation.getArgument(0);
            team.setId(UUID.randomUUID());
            return team;
        });
        when(matchTeamPlayerRepository.save(any(MatchTeamPlayer.class))).thenAnswer(invocation -> {
            MatchTeamPlayer player = invocation.getArgument(0);
            player.setId(UUID.randomUUID());
            return player;
        });

        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.TOURNAMENT,
            GameType.SINGLES,
            tournamentId,
            player1Id,
            11,
            3,
            true,
            List.of(
                new CreateMatchTeamRequest(List.of(player1Id)),
                new CreateMatchTeamRequest(List.of(player2Id))
            )
        );

        MatchResponse response = matchService.createMatch(request);

        assertNotNull(response.matchId());
        assertEquals(MatchMode.TOURNAMENT, response.mode());
        assertEquals(GameType.SINGLES, response.gameType());
        assertEquals(0, response.score1());
        assertEquals(0, response.score2());
        assertEquals(MatchStatus.SCHEDULED, response.status());
        assertEquals(player1Id, response.scorekeeperId());
        assertEquals(2, response.teams().size());
        verify(valueOperations).set(eq("match:summary:" + response.matchId()), any(MatchResponse.class));
    }

    @Test
    void createCasualDoublesMatchShouldAllowParticipatingScorekeeper() {
        UUID player1Id = UUID.randomUUID();
        UUID player2Id = UUID.randomUUID();
        UUID player3Id = UUID.randomUUID();
        UUID player4Id = UUID.randomUUID();

        User player1 = user(player1Id, "Player 1");
        User player2 = user(player2Id, "Player 2");
        User player3 = user(player3Id, "Player 3");
        User player4 = user(player4Id, "Player 4");

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(userRepository.findAllById(any())).thenReturn(List.of(player1, player2, player3, player4));
        when(userRepository.findById(player1Id)).thenReturn(Optional.of(player1));
        when(matchRepository.save(any(Match.class))).thenAnswer(invocation -> {
            Match match = invocation.getArgument(0);
            match.setId(UUID.randomUUID());
            return match;
        });
        when(matchTeamRepository.save(any(MatchTeam.class))).thenAnswer(invocation -> {
            MatchTeam team = invocation.getArgument(0);
            team.setId(UUID.randomUUID());
            return team;
        });
        when(matchTeamPlayerRepository.save(any(MatchTeamPlayer.class))).thenAnswer(invocation -> {
            MatchTeamPlayer player = invocation.getArgument(0);
            player.setId(UUID.randomUUID());
            return player;
        });

        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.CASUAL,
            GameType.DOUBLES,
            null,
            player1Id,
            15,
            5,
            true,
            List.of(
                new CreateMatchTeamRequest(List.of(player1Id, player2Id)),
                new CreateMatchTeamRequest(List.of(player3Id, player4Id))
            )
        );

        MatchResponse response = matchService.createMatch(request);

        assertEquals(MatchMode.CASUAL, response.mode());
        assertEquals(GameType.DOUBLES, response.gameType());
        assertEquals(player1Id, response.scorekeeperId());
        verify(registrationRepository, never()).existsByTournamentIdAndUserIdAndStatus(any(), any(), any());
    }

    @Test
    void createMatchShouldRejectInvalidBestOf() {
        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.CASUAL,
            GameType.SINGLES,
            null,
            null,
            11,
            7,
            true,
            List.of(
                new CreateMatchTeamRequest(List.of(UUID.randomUUID())),
                new CreateMatchTeamRequest(List.of(UUID.randomUUID()))
            )
        );

        assertThrows(BadRequestException.class, () -> matchService.createMatch(request));
    }

    @Test
    void getMatchShouldHydrateTeamsAndPlayers() {
        UUID matchId = UUID.randomUUID();
        UUID team1Id = UUID.randomUUID();
        UUID team2Id = UUID.randomUUID();
        UUID player1Id = UUID.randomUUID();
        UUID player2Id = UUID.randomUUID();

        User player1 = user(player1Id, "Player 1");
        User player2 = user(player2Id, "Player 2");

        Match match = Match.builder()
            .mode(MatchMode.CASUAL)
            .gameType(GameType.SINGLES)
            .pointsToWin(11)
            .bestOf(1)
            .winByTwo(true)
            .round("Friendly Match")
            .status(MatchStatus.SCHEDULED)
            .score1(0)
            .score2(0)
            .player1(player1)
            .player2(player2)
            .build();
        match.setId(matchId);

        MatchTeam team1 = MatchTeam.builder().match(match).teamNo(1).build();
        team1.setId(team1Id);
        MatchTeam team2 = MatchTeam.builder().match(match).teamNo(2).build();
        team2.setId(team2Id);

        MatchTeamPlayer team1Player = MatchTeamPlayer.builder().team(team1).user(player1).slotNo(1).build();
        MatchTeamPlayer team2Player = MatchTeamPlayer.builder().team(team2).user(player2).slotNo(1).build();

        when(matchRepository.findById(matchId)).thenReturn(Optional.of(match));
        when(matchTeamRepository.findByMatchIdOrderByTeamNoAsc(matchId)).thenReturn(List.of(team1, team2));
        when(matchTeamPlayerRepository.findByTeamIdOrderBySlotNoAsc(team1Id)).thenReturn(List.of(team1Player));
        when(matchTeamPlayerRepository.findByTeamIdOrderBySlotNoAsc(team2Id)).thenReturn(List.of(team2Player));

        MatchResponse response = matchService.getMatch(matchId);

        assertEquals(matchId, response.matchId());
        assertEquals(2, response.teams().size());
        assertEquals(1, response.teams().get(0).players().size());
        assertEquals(player1Id, response.teams().get(0).players().get(0).userId());
        assertTrue(response.teams().stream().anyMatch(t -> t.teamNo() == 2));
    }

    private User user(UUID id, String name) {
        User user = User.builder()
            .name(name)
            .email(name.toLowerCase().replace(" ", "") + "@example.com")
            .password("secret")
            .dateOfBirth(LocalDate.of(1990, 1, 1))
            .phoneNumber("+10000000000")
            .emailVerified(true)
            .phoneVerified(true)
            .authProvider("LOCAL")
            .build();
        user.setId(id);
        return user;
    }

    private Tournament tournament(UUID id, User createdBy, TournamentType type) {
        Tournament tournament = Tournament.builder()
            .name("Test Tournament")
            .description("desc")
            .sportType(SportType.PICKLEBALL)
            .tournamentType(type)
            .status(TournamentStatus.UPCOMING)
            .createdBy(createdBy)
            .maxPlayers(16)
            .startDate(LocalDateTime.now().plusDays(1))
            .build();
        tournament.setId(id);
        return tournament;
    }
}
