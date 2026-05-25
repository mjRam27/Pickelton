package com.pickelton.backend.user.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDTO(UUID id, String name, String email, String phoneNumber, LocalDate dateOfBirth,
                      boolean emailVerified, boolean phoneVerified, String bio, String avatarUrl,
                      String city, OffsetDateTime createdAt) {
}
