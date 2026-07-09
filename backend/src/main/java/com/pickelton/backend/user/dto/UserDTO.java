package com.pickelton.backend.user.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.PlatformRole;

public record UserDTO(UUID id, String name, String email, String phoneNumber, LocalDate dateOfBirth,
                      boolean emailVerified, boolean phoneVerified, String bio, String avatarUrl,
                      String city, PlatformRole role, OffsetDateTime createdAt) {
}
