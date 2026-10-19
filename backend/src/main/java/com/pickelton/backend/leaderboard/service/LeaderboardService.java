package com.pickelton.backend.leaderboard.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.TournamentType;
import com.pickelton.backend.leaderboard.dto.CategoryLeaderboardResponse;
import com.pickelton.backend.leaderboard.dto.LeaderboardEntryResponse;
import com.pickelton.backend.leaderboard.dto.LeaderboardResponse;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.match.entity.MatchState;
import com.pickelton.backend.match.entity.TournamentMatch;
import com.pickelton.backend.match.repository.MatchParticipantRepository;
import com.pickelton.backend.match.repository.MatchStateRepository;
import com.pickelton.backend.match.repository.TournamentMatchRepository;
import com.pickelton.backend.registration.entity.Registration;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.entity.TournamentCategory;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Standings from completed matches. Each side of a match (one player, or a doubles pair) is a row.
// Ranked by wins, then fewest losses, then point difference, then points scored.
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private static final Comparator<Row> RANKING = Comparator.comparingInt((Row row) -> row.won).reversed()
        .thenComparingInt(row -> row.lost)
        .thenComparing(Comparator.comparingInt((Row row) -> row.pointsFor - row.pointsAgainst).reversed())
        .thenComparing(Comparator.comparingInt((Row row) -> row.pointsFor).reversed())
        .thenComparing(Row::name);

    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchParticipantRepository participantRepository;
    private final MatchStateRepository matchStateRepository;

    public LeaderboardResponse getLeaderboard(UUID tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        List<Registration> registrations = registrationRepository.findByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED);
        List<Result> results = tournamentMatchRepository.findByTournamentIdOrderByCreatedAtAsc(tournamentId).stream()
            .filter(link -> link.getMatch().getStatus() == MatchStatus.COMPLETED)
            .map(this::result)
            .filter(Objects::nonNull)
            .toList();

        boolean noCategories = tournament.getCategories().isEmpty();
        List<User> overallSingles = noCategories && tournament.getTournamentType() == TournamentType.SINGLES
            ? registrations.stream().map(Registration::getUser).toList() : List.of();
        List<LeaderboardEntryResponse> overall = rank(results, overallSingles);

        List<CategoryLeaderboardResponse> categories = new ArrayList<>();
        for (TournamentCategory category : tournament.getCategories()) {
            List<Result> inCategory = results.stream().filter(result -> category.getId().equals(result.categoryId())).toList();
            List<User> singles = category.getFormat() == TournamentType.SINGLES
                ? registrations.stream()
                    .filter(registration -> registration.getCategories().stream().anyMatch(entered -> entered.getId().equals(category.getId())))
                    .map(Registration::getUser).toList()
                : List.of();
            categories.add(new CategoryLeaderboardResponse(category.getId(), category.getName(), category.getFormat(),
                inCategory.size(), rank(inCategory, singles)));
        }
        return new LeaderboardResponse(tournamentId, overall, categories);
    }

    // Registered singles players who haven't played yet still get a row, so the table lists everyone.
    private static List<LeaderboardEntryResponse> rank(List<Result> results, List<User> registeredSingles) {
        Map<String, Row> rows = new LinkedHashMap<>();
        registeredSingles.forEach(user -> rows.computeIfAbsent(user.getId().toString(), key -> new Row(List.of(user))));
        for (Result result : results) {
            Row sideA = rows.computeIfAbsent(key(result.teamA()), key -> new Row(result.teamA()));
            Row sideB = rows.computeIfAbsent(key(result.teamB()), key -> new Row(result.teamB()));
            sideA.add(result.scoreA(), result.scoreB(), "A".equals(result.winner()), "B".equals(result.winner()));
            sideB.add(result.scoreB(), result.scoreA(), "B".equals(result.winner()), "A".equals(result.winner()));
        }
        return rows.values().stream().sorted(RANKING).map(Row::toResponse).toList();
    }

    private Result result(TournamentMatch link) {
        Match match = link.getMatch();
        List<MatchParticipant> players = participantRepository.findByMatchIdAndRole(match.getId(), ParticipantRole.PLAYER);
        List<User> teamA = team(players, "A");
        List<User> teamB = team(players, "B");
        if (teamA.isEmpty() || teamB.isEmpty()) {
            return null;
        }
        int[] score = totalScore(matchStateRepository.findByMatchId(match.getId()).orElse(null));
        String winner = null;
        if (match.getWinner() != null) {
            UUID winnerId = match.getWinner().getId();
            if (teamA.stream().anyMatch(user -> user.getId().equals(winnerId))) {
                winner = "A";
            } else if (teamB.stream().anyMatch(user -> user.getId().equals(winnerId))) {
                winner = "B";
            }
        }
        UUID categoryId = link.getCategory() != null ? link.getCategory().getId() : null;
        return new Result(categoryId, teamA, teamB, score[0], score[1], winner);
    }

    private static List<User> team(List<MatchParticipant> players, String code) {
        return players.stream()
            .filter(participant -> code.equalsIgnoreCase(participant.getTeam()))
            .map(MatchParticipant::getUser)
            .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER))
            .toList();
    }

    // Points across finished sets plus the set in progress when the match ended.
    // A finished set is stored as {set, score: {A, B}} or, from older clients, as {A, B}.
    private static int[] totalScore(MatchState state) {
        int[] total = {0, 0};
        if (state == null) {
            return total;
        }
        for (Map<String, Object> set : state.getSetSummary()) {
            Map<?, ?> score = set.get("score") instanceof Map<?, ?> nested ? nested : set;
            total[0] += number(score.get("A"));
            total[1] += number(score.get("B"));
        }
        total[0] += number(state.getCurrentScore().get("A"));
        total[1] += number(state.getCurrentScore().get("B"));
        return total;
    }

    private static int number(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return value == null ? 0 : Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private static String key(List<User> team) {
        return team.stream().map(user -> user.getId().toString()).sorted().collect(Collectors.joining("+"));
    }

    private record Result(UUID categoryId, List<User> teamA, List<User> teamB, int scoreA, int scoreB, String winner) {
    }

    private static final class Row {
        private final List<User> players;
        private int played;
        private int won;
        private int lost;
        private int pointsFor;
        private int pointsAgainst;

        private Row(List<User> players) {
            this.players = players;
        }

        private void add(int scored, int conceded, boolean win, boolean loss) {
            played++;
            pointsFor += scored;
            pointsAgainst += conceded;
            won += win ? 1 : 0;
            lost += loss ? 1 : 0;
        }

        private String name() {
            return players.stream().map(User::getName).collect(Collectors.joining(" / "));
        }

        private LeaderboardEntryResponse toResponse() {
            return new LeaderboardEntryResponse(players.get(0).getId(), name(),
                players.stream().map(user -> new LeaderboardEntryResponse.Player(user.getId(), user.getName())).toList(),
                played, won, lost, pointsFor, pointsAgainst, pointsFor - pointsAgainst, won * 3);
        }
    }
}
