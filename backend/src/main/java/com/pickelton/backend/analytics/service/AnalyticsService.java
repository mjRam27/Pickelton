package com.pickelton.backend.analytics.service;

import java.time.OffsetDateTime;
import java.util.List;

import com.pickelton.backend.analytics.entity.ClubStats;
import com.pickelton.backend.analytics.entity.PlayerStats;
import com.pickelton.backend.analytics.repository.ClubStatsRepository;
import com.pickelton.backend.analytics.repository.PlayerStatsRepository;
import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PlayerStatsRepository playerStatsRepository;
    private final ClubStatsRepository clubStatsRepository;

    @Transactional
    public void recordCompletedMatch(Match match, List<MatchParticipant> participants) {
        List<MatchParticipant> players = participants.stream()
            .filter(participant -> participant.getRole() == ParticipantRole.PLAYER)
            .toList();
        if (players.isEmpty()) {
            return;
        }
        String winningTeam = winningTeam(match, players);
        for (MatchParticipant participant : players) {
            boolean won = winningTeam != null && winningTeam.equalsIgnoreCase(participant.getTeam());
            updatePlayer(match, participant.getUser(), won);
        }
        if (match.getClub() != null) {
            updateClub(match.getClub(), match, winningTeam != null);
        }
    }

    private void updatePlayer(Match match, User user, boolean won) {
        PlayerStats stats = playerStatsRepository.findByUserIdAndSportType(user.getId(), match.getSport())
            .orElseGet(() -> PlayerStats.builder().user(user).sportType(match.getSport()).build());
        stats.setMatchesPlayed(stats.getMatchesPlayed() + 1);
        stats.setLastMatchAt(OffsetDateTime.now());
        if (won) {
            stats.setWins(stats.getWins() + 1);
            stats.setCurrentStreak(Math.max(1, stats.getCurrentStreak() + 1));
            stats.setLongestStreak(Math.max(stats.getLongestStreak(), stats.getCurrentStreak()));
            stats.setRating(stats.getRating() + 15);
        } else {
            stats.setLosses(stats.getLosses() + 1);
            stats.setCurrentStreak(0);
            stats.setRating(Math.max(100, stats.getRating() - 8));
        }
        playerStatsRepository.save(stats);
    }

    private void updateClub(Club club, Match match, boolean hasWinner) {
        ClubStats stats = clubStatsRepository.findByClubIdAndSportType(club.getId(), match.getSport())
            .orElseGet(() -> ClubStats.builder().club(club).sportType(match.getSport()).build());
        stats.setMatchesPlayed(stats.getMatchesPlayed() + 1);
        if (hasWinner) {
            stats.setWins(stats.getWins() + 1);
            stats.setClubRating(stats.getClubRating() + 10);
        } else {
            stats.setLosses(stats.getLosses() + 1);
            stats.setClubRating(Math.max(100, stats.getClubRating() - 4));
        }
        clubStatsRepository.save(stats);
    }

    private String winningTeam(Match match, List<MatchParticipant> players) {
        if (match.getWinner() == null) {
            return null;
        }
        return players.stream()
            .filter(participant -> participant.getUser().getId().equals(match.getWinner().getId()))
            .map(MatchParticipant::getTeam)
            .findFirst()
            .orElse(null);
    }
}
