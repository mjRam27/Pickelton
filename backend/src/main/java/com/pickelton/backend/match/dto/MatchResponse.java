package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;

public record MatchResponse(UUID id, UUID tournamentId, UUID player1Id, UUID player2Id, Integer score1,
                            Integer score2, UUID winnerId, String round, MatchStatus status,
                            OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
