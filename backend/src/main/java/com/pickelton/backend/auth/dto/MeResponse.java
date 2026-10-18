package com.pickelton.backend.auth.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MeResponse(UUID id, String name, String email, String phoneNumber, LocalDate dateOfBirth,
                         boolean emailVerified, boolean phoneVerified, OffsetDateTime createdAt) {
}
