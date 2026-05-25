package com.pickelton.backend.user.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PublicUserResponse(UUID id, String name, String bio, String avatarUrl, String city,
                                 UserStatsDTO stats, OffsetDateTime createdAt) {
}
