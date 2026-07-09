package com.pickelton.backend.team.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.user.dto.PublicUserSummary;

public record TeamInvitationResponse(
    UUID id,
    UUID teamId,
    String teamName,
    PublicUserSummary invitedUser,
    PublicUserSummary invitedBy,
    InvitationStatus status,
    OffsetDateTime createdAt
) {
}
