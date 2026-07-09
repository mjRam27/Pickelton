package com.pickelton.backend.team.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TeamStatus;
import com.pickelton.backend.user.dto.PublicUserSummary;

public record TeamResponse(
    UUID id,
    String name,
    SportType sportType,
    TeamStatus status,
    PublicUserSummary captain,
    List<TeamMemberResponse> members,
    OffsetDateTime createdAt
) {
}
