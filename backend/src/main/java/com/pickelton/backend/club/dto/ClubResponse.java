package com.pickelton.backend.club.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.user.dto.PublicUserSummary;

// distanceKm is only set when the list was requested with the caller's coordinates.
public record ClubResponse(UUID id, String name, String description, String location, Double latitude, Double longitude,
                           Double distanceKm, PublicUserSummary createdBy, long memberCount,
                           OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
