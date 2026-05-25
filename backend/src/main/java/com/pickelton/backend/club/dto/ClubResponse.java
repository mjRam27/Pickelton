package com.pickelton.backend.club.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.user.dto.PublicUserSummary;

public record ClubResponse(UUID id, String name, String description, String location, PublicUserSummary createdBy,
                           long memberCount, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
