package com.pickelton.backend.leaderboard.dto;

import java.util.List;
import java.util.UUID;

// entries ranks the whole event; categories has one table per category (empty for events without categories).
public record LeaderboardResponse(UUID tournamentId, List<LeaderboardEntryResponse> entries,
                                  List<CategoryLeaderboardResponse> categories) {
}
