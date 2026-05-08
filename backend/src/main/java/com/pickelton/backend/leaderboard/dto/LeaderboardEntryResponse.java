package com.pickelton.backend.leaderboard.dto;

import java.util.UUID;

import com.pickelton.backend.enums.SportType;

public record LeaderboardEntryResponse(UUID userId, String name, String email, SportType sportType,
                                       int played, int won, int lost, int points) {
}