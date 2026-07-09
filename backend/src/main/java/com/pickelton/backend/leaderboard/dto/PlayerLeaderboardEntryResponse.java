package com.pickelton.backend.leaderboard.dto;

import java.util.UUID;

public record PlayerLeaderboardEntryResponse(
    UUID userId,
    String name,
    String avatarUrl,
    String city,
    int matchesPlayed,
    int wins,
    int losses,
    int rating
) {
}
