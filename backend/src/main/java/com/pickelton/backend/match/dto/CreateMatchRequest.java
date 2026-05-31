package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchParticipantRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMatchRequest(
    MatchMode mode,
    UUID tournamentId,
    UUID player1Id,
    UUID player2Id,
    @Valid List<ParticipantRequest> participants,
    UUID scorerId,
    UUID refereeId,
    Map<String, Object> rules,
    @Size(max = 255) String venue,
    OffsetDateTime scheduledAt,
    @Size(max = 50, message = "Round must be at most 50 characters") String round
) {
    public record ParticipantRequest(
        @NotNull UUID userId,
        @NotBlank @Size(max = 10) String teamCode,
        MatchParticipantRole role
    ) {
    }
}
