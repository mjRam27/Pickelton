package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;

public record MatchResponse(
    UUID id,
    UUID tournamentId,
    UUID player1Id,
    UUID player2Id,
    Integer score1,
    Integer score2,
    UUID winnerId,
    String round,
    MatchStatus status,
    List<MatchParticipantResponse> participants,
    Map<String, Object> rules,
    String venue,
    OffsetDateTime scheduledAt,
    List<Map<String, Integer>> sets,
    Long revision,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
