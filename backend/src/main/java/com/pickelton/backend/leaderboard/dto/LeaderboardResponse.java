package com.pickelton.backend.leaderboard.dto;

import java.util.List;
import java.util.UUID;

public record LeaderboardResponse(UUID tournamentId, List<LeaderboardEntryResponse> entries) {
}