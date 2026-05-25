package com.pickelton.backend.club.dto;

import java.util.UUID;
import java.time.OffsetDateTime;

import com.pickelton.backend.enums.ClubRole;
import com.pickelton.backend.user.dto.PublicUserSummary;

public record ClubMemberResponse(UUID id, UUID clubId, PublicUserSummary user, ClubRole role,
                                 OffsetDateTime joinedAt) {
}
