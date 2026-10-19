package com.pickelton.backend.leaderboard.dto;

import java.util.List;
import java.util.UUID;

// One row: a singles player or a doubles pair. userId is the first player (kept for older clients);
// name joins the pair's names. points = 3 per win.
public record LeaderboardEntryResponse(UUID userId, String name, List<Player> players, int played, int won, int lost,
                                       int pointsFor, int pointsAgainst, int pointDiff, int points) {

    public record Player(UUID userId, String name) {
    }
}
