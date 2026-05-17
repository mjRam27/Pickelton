package com.pickelton.backend.leaderboard.dto;

import java.util.UUID;

public record LeaderboardEntryResponse(UUID userId, String name, String email, String sportType,
                                       int played, int won, int lost, int points) {
}
