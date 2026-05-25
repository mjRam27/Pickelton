package com.pickelton.backend.leaderboard.dto;

import java.util.UUID;

public record LeaderboardEntryResponse(UUID userId, String name, int played, int won, int lost, int points) {
}
