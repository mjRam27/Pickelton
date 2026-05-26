package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.GameType;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchStatus;

public record MatchResponse(UUID matchId, UUID tournamentId, MatchMode mode, GameType gameType,
                            Integer pointsToWin, Integer bestOf, Boolean winByTwo, UUID scorekeeperId,
                            Integer score1, Integer score2, UUID winnerId, String round, MatchStatus status,
                            List<MatchTeamResponse> teams,
                            OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
