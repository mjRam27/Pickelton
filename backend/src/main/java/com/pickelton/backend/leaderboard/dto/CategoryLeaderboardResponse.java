package com.pickelton.backend.leaderboard.dto;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.TournamentType;

public record CategoryLeaderboardResponse(UUID categoryId, String name, TournamentType format, int completedMatches,
                                          List<LeaderboardEntryResponse> entries) {
}
