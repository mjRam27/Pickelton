package com.pickelton.backend.match.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.MatchType;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.enums.SportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMatchRequest(
    @NotNull(message = "Tournament is required") UUID tournamentId,
    UUID player1Id,
    UUID player2Id,
    List<ParticipantRequest> participants,
    UUID scorerId,
    UUID refereeId,
    SportType sport,
    MatchType matchType,
    OffsetDateTime scheduledAt,
    @Size(max = 255, message = "Location must be at most 255 characters") String location,
    Map<String, Object> rules,
    @NotBlank(message = "Round is required") @Size(max = 50, message = "Round must be at most 50 characters") String round
) {
    public record ParticipantRequest(
        @NotNull(message = "Participant user is required") UUID userId,
        @Size(max = 20, message = "Team must be at most 20 characters") String team,
        @NotNull(message = "Role is required") ParticipantRole role
    ) {
    }
}
