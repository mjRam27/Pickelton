package com.pickelton.backend.match.dto;

import java.util.UUID;

import com.pickelton.backend.enums.ParticipantRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InviteParticipantRequest(
    @NotNull(message = "User is required") UUID userId,
    @NotNull(message = "Role is required") ParticipantRole role,
    @Size(max = 20, message = "Team must be at most 20 characters") String team
) {
}
