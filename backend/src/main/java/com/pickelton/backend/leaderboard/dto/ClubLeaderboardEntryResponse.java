package com.pickelton.backend.leaderboard.dto;

import java.util.UUID;

public record ClubLeaderboardEntryResponse(
    UUID clubId,
    String name,
    String logoUrl,
    String city,
    int matchesPlayed,
    int wins,
    int losses,
    int rating
) {
}
