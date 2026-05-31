package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;

public record MatchScorecardResponse(
    UUID matchId,
    UUID tournamentId,
    String round,
    MatchStatus status,
    String venue,
    OffsetDateTime scheduledAt,
    List<MatchParticipantResponse> participants,
    Map<String, Integer> scores,
    Integer currentGameNumber,
    Integer pointsToWin,
    Integer bestOf,
    Boolean winByTwo,
    UUID scorekeeperId,
    UUID winnerId,
    Long revision,
    OffsetDateTime updatedAt,
    OffsetDateTime createdAt
) {
}
