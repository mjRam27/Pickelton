package com.pickelton.backend.registration.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.RegistrationStatus;

public record RegistrationResponse(UUID id, UUID userId, UUID tournamentId, RegistrationStatus status,
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {
}