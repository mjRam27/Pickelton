package com.pickelton.backend.match.service;

import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.GameType;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.CreateMatchTeamRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.UpdateMatchScoreRequest;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchTeam;
import com.pickelton.backend.match.entity.MatchTeamPlayer;
import com.pickelton.backend.match.entity.ScoreHistory;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.match.repository.MatchTeamPlayerRepository;
import com.pickelton.backend.match.repository.MatchTeamRepository;
import com.pickelton.backend.match.repository.ScoreHistoryRepository;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private static final Set<Integer> ALLOWED_BEST_OF = Set.of(1, 3, 5);
    private static final String MATCH_SUMMARY_CACHE_KEY_PREFIX = "match:summary:";
    private static final String CASUAL_ROUND = "Friendly Match";
    private static final String TOURNAMENT_ROUND = "Tournament Match";

    private final MatchRepository matchRepository;
    private final MatchTeamRepository matchTeamRepository;
    private final MatchTeamPlayerRepository matchTeamPlayerRepository;
    private final ScoreHistoryRepository scoreHistoryRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CurrentUserService currentUserService;
    private final ScoreBroadcastService scoreBroadcastService;
    private final MatchMapper matchMapper;

    public MatchResponse createMatch(CreateMatchRequest request) {
        validateMatchRules(request);
        validateTeams(request);
        Tournament tournament = requireTournamentByMode(request);

        List<UUID> playerIds = request.teams().stream()
            .flatMap(team -> team.playerIds().stream())
            .toList();
        Map<UUID, User> usersById = userRepository.findAllById(playerIds).stream()
            .collect(Collectors.toMap(User::getId, user -> user));
        if (usersById.size() != new HashSet<>(playerIds).size()) {
            throw new ResourceNotFoundException("One or more players not found");
        }

        if (request.mode() == MatchMode.TOURNAMENT && tournament != null) {
            validateTournamentPlayers(tournament.getId(), playerIds);
        }

        User scorekeeper = request.scorekeeperId() == null ? null
            : userRepository.findById(request.scorekeeperId())
                .orElseThrow(() -> new ResourceNotFoundException("Scorekeeper not found"));
        List<User> team1Players = resolveTeamPlayers(request.teams().get(0), usersById);
        List<User> team2Players = resolveTeamPlayers(request.teams().get(1), usersById);

        Match match = Match.builder()
            .tournament(tournament)
            .player1(team1Players.get(0))
            .player2(team2Players.get(0))
            .scorekeeper(scorekeeper)
            .mode(request.mode())
            .gameType(request.gameType())
            .pointsToWin(request.pointsToWin())
            .bestOf(request.bestOf())
            .winByTwo(request.winByTwo())
            .round(request.mode() == MatchMode.CASUAL ? CASUAL_ROUND : TOURNAMENT_ROUND)
            .status(MatchStatus.SCHEDULED)
            .score1(0)
            .score2(0)
            .build();
        Match savedMatch = matchRepository.save(match);

        MatchTeam savedTeam1 = matchTeamRepository.save(MatchTeam.builder().match(savedMatch).teamNo(1).build());
        MatchTeam savedTeam2 = matchTeamRepository.save(MatchTeam.builder().match(savedMatch).teamNo(2).build());
        saveTeamPlayers(savedTeam1, team1Players);
        saveTeamPlayers(savedTeam2, team2Players);

        savedMatch.getTeams().clear();
        savedMatch.getTeams().add(savedTeam1);
        savedMatch.getTeams().add(savedTeam2);
        MatchResponse response = matchMapper.toResponse(savedMatch);
        cacheMatchSummary(response);
        return response;
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatch(UUID id) {
        return matchMapper.toResponse(requireMatch(id));
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getTournamentMatches(UUID tournamentId) {
        requireTournament(tournamentId);
        return matchRepository.findByTournamentIdOrderByCreatedAtAscWithTeams(tournamentId).stream()
            .map(matchMapper::toResponse).toList();
    }

    public MatchResponse updateScore(UUID id, UpdateMatchScoreRequest request) {
        Match match = requireMatch(id);
        if (match.getTournament() == null) {
            throw new BadRequestException("Casual match score updates are not supported yet");
        }
        requireOrganizer(match.getTournament());
        if (match.getTournament().getStatus() != TournamentStatus.ONGOING) {
            throw new BadRequestException("Scores can only be recorded while the tournament is ongoing");
        }
        if (match.getStatus() == MatchStatus.CANCELLED) {
            throw new BadRequestException("Cancelled match cannot be scored");
        }
        if (request.score1().equals(request.score2())) {
            throw new BadRequestException("A match cannot end in a tie");
        }
        User updater = currentUserService.getCurrentUser();
        scoreHistoryRepository.save(ScoreHistory.builder().match(match).player(match.getPlayer1())
            .oldScore(match.getScore1()).newScore(request.score1()).updatedBy(updater).build());
        scoreHistoryRepository.save(ScoreHistory.builder().match(match).player(match.getPlayer2())
            .oldScore(match.getScore2()).newScore(request.score2()).updatedBy(updater).build());
        match.setScore1(request.score1());
        match.setScore2(request.score2());
        match.setWinner(request.score1() > request.score2() ? match.getPlayer1() : match.getPlayer2());
        match.setStatus(MatchStatus.COMPLETED);
        Match saved = matchRepository.saveAndFlush(match);
        scoreBroadcastService.broadcastScoreUpdate(saved.getId(), new ScoreBroadcastService.ScoreUpdatePayload(
            saved.getId(), saved.getScore1(), saved.getScore2(), saved.getStatus(), saved.getUpdatedAt()));
        return matchMapper.toResponse(saved);
    }

    public MatchResponse cancelMatch(UUID id) {
        Match match = requireMatch(id);
        if (match.getTournament() == null) {
            throw new BadRequestException("Casual match cancellation is not supported yet");
        }
        requireOrganizer(match.getTournament());
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new BadRequestException("Completed match cannot be cancelled");
        }
        match.setStatus(MatchStatus.CANCELLED);
        return matchMapper.toResponse(matchRepository.save(match));
    }

    private User requireRegisteredPlayer(UUID tournamentId, UUID userId, String label) {
        if (!registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, userId, RegistrationStatus.REGISTERED)) {
            throw new BadRequestException(label + " must be registered in the tournament");
        }
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException(label + " not found"));
    }

    private Tournament requireTournament(UUID id) {
        return tournamentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private Match requireMatch(UUID id) {
        Match match = matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
        hydrateTeams(match);
        return match;
    }

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage matches");
        }
    }

    private Tournament requireTournamentByMode(CreateMatchRequest request) {
        if (request.mode() == MatchMode.TOURNAMENT) {
            if (request.tournamentId() == null) {
                throw new BadRequestException("Tournament is required for tournament matches");
            }
            Tournament tournament = requireTournament(request.tournamentId());
            requireOrganizer(tournament);
            if (tournament.getStatus() == TournamentStatus.FINISHED || tournament.getStatus() == TournamentStatus.CANCELLED) {
                throw new BadRequestException("Matches cannot be created for a closed tournament");
            }
            if (!tournament.getTournamentType().name().equals(request.gameType().name())) {
                throw new BadRequestException("Game type must match tournament type");
            }
            return tournament;
        }
        if (request.tournamentId() != null) {
            throw new BadRequestException("Tournament id is not allowed for casual matches");
        }
        return null;
    }

    private void validateMatchRules(CreateMatchRequest request) {
        if (request.bestOf() == null || !ALLOWED_BEST_OF.contains(request.bestOf())) {
            throw new BadRequestException("Best of must be one of 1, 3, or 5");
        }
        if (request.pointsToWin() == null || request.pointsToWin() < 11) {
            throw new BadRequestException("Points to win must be at least 11");
        }
    }

    private void validateTeams(CreateMatchRequest request) {
        if (request.teams() == null || request.teams().size() != 2) {
            throw new BadRequestException("Exactly 2 teams are required");
        }

        int expectedTeamSize = request.gameType() == GameType.SINGLES ? 1 : 2;
        Set<UUID> uniquePlayers = new HashSet<>();
        for (CreateMatchTeamRequest team : request.teams()) {
            if (team.playerIds() == null || team.playerIds().size() != expectedTeamSize) {
                throw new BadRequestException(
                    request.gameType() == GameType.SINGLES
                        ? "Singles matches require exactly 1 player per team"
                        : "Doubles matches require exactly 2 players per team"
                );
            }
            for (UUID playerId : team.playerIds()) {
                if (!uniquePlayers.add(playerId)) {
                    throw new BadRequestException("A player cannot appear in more than one team");
                }
            }
        }
    }

    private void validateTournamentPlayers(UUID tournamentId, List<UUID> playerIds) {
        for (UUID playerId : playerIds) {
            requireRegisteredPlayer(tournamentId, playerId, "Player");
        }
    }

    private List<User> resolveTeamPlayers(CreateMatchTeamRequest teamRequest, Map<UUID, User> usersById) {
        return teamRequest.playerIds().stream()
            .map(playerId -> {
                User player = usersById.get(playerId);
                if (player == null) {
                    throw new ResourceNotFoundException("Player not found");
                }
                return player;
            })
            .toList();
    }

    private void saveTeamPlayers(MatchTeam team, List<User> teamPlayers) {
        for (int i = 0; i < teamPlayers.size(); i++) {
            MatchTeamPlayer saved = matchTeamPlayerRepository.save(
                MatchTeamPlayer.builder()
                    .team(team)
                    .user(teamPlayers.get(i))
                    .slotNo(i + 1)
                    .build()
            );
            team.getPlayers().add(saved);
        }
    }

    private void hydrateTeams(Match match) {
        List<MatchTeam> teams = matchTeamRepository.findByMatchIdOrderByTeamNoAsc(match.getId());
        for (MatchTeam team : teams) {
            List<MatchTeamPlayer> players = matchTeamPlayerRepository.findByTeamIdOrderBySlotNoAsc(team.getId());
            team.getPlayers().clear();
            team.getPlayers().addAll(players);
        }
        match.getTeams().clear();
        match.getTeams().addAll(teams);
    }

    private void cacheMatchSummary(MatchResponse response) {
        try {
            redisTemplate.opsForValue().set(MATCH_SUMMARY_CACHE_KEY_PREFIX + response.matchId(), response);
        } catch (Exception ex) {
            log.warn("Failed to cache match summary for matchId={}", response.matchId(), ex);
        }
    }
}
