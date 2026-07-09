package com.pickelton.backend.club.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.user.dto.PublicUserSummary;

public record ClubInvitationResponse(
    UUID id,
    UUID clubId,
    String clubName,
    PublicUserSummary invitedUser,
    PublicUserSummary invitedBy,
    InvitationStatus status,
    OffsetDateTime createdAt
) {
}
