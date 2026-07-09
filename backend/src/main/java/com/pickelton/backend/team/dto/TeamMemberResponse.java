package com.pickelton.backend.team.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.TeamRole;
import com.pickelton.backend.user.dto.PublicUserSummary;

public record TeamMemberResponse(
    UUID id,
    UUID teamId,
    PublicUserSummary user,
    TeamRole role,
    String status,
    OffsetDateTime joinedAt
) {
}
