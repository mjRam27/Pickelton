package com.pickelton.backend.club.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.pickelton.backend.user.dto.UserResponse;

public record ClubResponse(UUID id, String name, String description, String location, UserResponse createdBy,
                           long memberCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
}