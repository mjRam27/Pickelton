package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.MatchType;
import com.pickelton.backend.enums.SportType;

public record MatchResponse(UUID id, UUID tournamentId, UUID player1Id, UUID player2Id, Integer score1,
                            Integer score2, UUID winnerId, String round, MatchStatus status,
                            SportType sport, MatchType matchType, String location, OffsetDateTime scheduledAt,
                            Map<String, Object> rules, List<MatchParticipantResponse> participants,
                            Map<String, Object> currentScore, Integer currentSet,
                            List<Map<String, Object>> setSummary, Long revision,
                            OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
