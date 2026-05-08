package com.pickelton.backend.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.SportType;

public record UserResponse(UUID id, String name, String email, SportType sportType, LocalDateTime createdAt,
                           LocalDateTime updatedAt) {
}