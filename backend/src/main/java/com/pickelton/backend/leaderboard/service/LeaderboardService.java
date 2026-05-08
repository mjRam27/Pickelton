package com.pickelton.backend.leaderboard.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.leaderboard.dto.LeaderboardEntryResponse;
import com.pickelton.backend.leaderboard.dto.LeaderboardResponse;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final MatchRepository matchRepository;

    public LeaderboardResponse getLeaderboard(UUID tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResourceNotFoundException("Tournament not found");
        }

        Map<UUID, Stats> statsMap = new HashMap<>();

        registrationRepository.findByTournamentId(tournamentId)
            .forEach(registration -> statsMap.putIfAbsent(registration.getUser().getId(), new Stats(registration.getUser())));

        matchRepository.findByTournamentId(tournamentId).forEach(match -> {
            if (match.getPlayer1() != null) {
                statsMap.putIfAbsent(match.getPlayer1().getId(), new Stats(match.getPlayer1()));
                statsMap.get(match.getPlayer1().getId()).played++;
            }
            if (match.getPlayer2() != null) {
                statsMap.putIfAbsent(match.getPlayer2().getId(), new Stats(match.getPlayer2()));
                statsMap.get(match.getPlayer2().getId()).played++;
            }

            User winner = match.getWinner();
            if (winner != null) {
                statsMap.get(winner.getId()).won++;
                User loser = winner.getId().equals(match.getPlayer1().getId()) ? match.getPlayer2() : match.getPlayer1();
                if (loser != null) {
                    statsMap.get(loser.getId()).lost++;
                }
            }
        });

        List<LeaderboardEntryResponse> entries = statsMap.values().stream()
            .map(Stats::toResponse)
            .sorted((left, right) -> {
                int pointsComparison = Integer.compare(right.points(), left.points());
                if (pointsComparison != 0) {
                    return pointsComparison;
                }
                int winsComparison = Integer.compare(right.won(), left.won());
                if (winsComparison != 0) {
                    return winsComparison;
                }
                return Integer.compare(left.lost(), right.lost());
            })
            .toList();

        return new LeaderboardResponse(tournamentId, entries);
    }

    private static final class Stats {
        private final User user;
        private int played;
        private int won;
        private int lost;

        private Stats(User user) {
            this.user = user;
        }

        private LeaderboardEntryResponse toResponse() {
            return new LeaderboardEntryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getSportType(),
                played,
                won,
                lost,
                won * 3
            );
        }
    }
}