package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;

public record LiveScoreResponse(
    UUID matchId,
    MatchStatus status,
    Map<String, Object> currentScore,
    Integer currentSet,
    List<Map<String, Object>> setSummary,
    Map<String, Object> liveState,
    Long revision,
    OffsetDateTime updatedAt
) {
}
