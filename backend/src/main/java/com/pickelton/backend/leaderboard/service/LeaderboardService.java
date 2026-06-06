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
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
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

        tournamentMatchRepository.findByTournamentIdOrderByCreatedAtAsc(tournamentId).stream()
            .map(link -> link.getMatch())
            .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
            .forEach(match -> applyMatch(statsMap, match));

        List<LeaderboardEntryResponse> entries = stats.values().stream()
            .map(Stats::toResponse)
            .sorted((left, right) -> {
                int points = Integer.compare(right.points(), left.points());
                return points != 0 ? points : Integer.compare(right.won(), left.won());
            })
            .toList();
        return new LeaderboardResponse(tournamentId, entries);
    }

    private void applyMatch(Map<UUID, Stats> statsMap, Match match) {
        List<MatchParticipant> players = participantRepository.findByMatchIdAndRole(match.getId(), ParticipantRole.PLAYER);
        players.forEach(participant -> {
            User player = participant.getUser();
            statsMap.putIfAbsent(player.getId(), new Stats(player));
            statsMap.get(player.getId()).played++;
        });

        User winner = match.getWinner();
        if (winner != null) {
            statsMap.putIfAbsent(winner.getId(), new Stats(winner));
            statsMap.get(winner.getId()).won++;
            players.stream()
                .map(MatchParticipant::getUser)
                .filter(player -> !player.getId().equals(winner.getId()))
                .forEach(player -> statsMap.get(player.getId()).lost++);
        }
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
