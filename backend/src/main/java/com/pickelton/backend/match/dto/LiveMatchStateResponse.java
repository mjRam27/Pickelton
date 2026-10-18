package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;

public record LiveMatchStateResponse(UUID matchId, MatchStatus status, Map<String, Integer> scores,
                                     List<Map<String, Integer>> sets, long revision, OffsetDateTime updatedAt) {
}
