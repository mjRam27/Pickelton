package com.pickelton.backend.leaderboard.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.leaderboard.dto.LeaderboardEntryResponse;
import com.pickelton.backend.leaderboard.dto.LeaderboardResponse;
import com.pickelton.backend.match.repository.MatchParticipantRepository;
import com.pickelton.backend.match.repository.TournamentMatchRepository;
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
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchParticipantRepository participantRepository;

    public LeaderboardResponse getLeaderboard(UUID tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResourceNotFoundException("Tournament not found");
        }
        Map<UUID, Stats> stats = new HashMap<>();
        registrationRepository.findByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED)
            .forEach(registration -> stats.putIfAbsent(registration.getUser().getId(), new Stats(registration.getUser())));

        tournamentMatchRepository.findByTournamentIdOrderByDisplayOrderAscCreatedAtAsc(tournamentId).stream()
            .map(link -> link.getMatch())
            .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
            .forEach(match -> {
                List<User> players = participantRepository.findByMatchIdOrderByCreatedAtAsc(match.getId()).stream()
                    .filter(participant -> participant.getRole() == MatchParticipantRole.PLAYER)
                    .map(participant -> participant.getUser())
                    .toList();
                players.forEach(player -> {
                    stats.putIfAbsent(player.getId(), new Stats(player));
                    stats.get(player.getId()).played++;
                });
                if (match.getWinner() != null) {
                    stats.putIfAbsent(match.getWinner().getId(), new Stats(match.getWinner()));
                    stats.get(match.getWinner().getId()).won++;
                    players.stream()
                        .filter(player -> !player.getId().equals(match.getWinner().getId()))
                        .forEach(player -> stats.get(player.getId()).lost++);
                }
            });

        List<LeaderboardEntryResponse> entries = stats.values().stream()
            .map(Stats::toResponse)
            .sorted((left, right) -> {
                int points = Integer.compare(right.points(), left.points());
                return points != 0 ? points : Integer.compare(right.won(), left.won());
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
            return new LeaderboardEntryResponse(user.getId(), user.getName(), played, won, lost, won * 3);
        }
    }
}
