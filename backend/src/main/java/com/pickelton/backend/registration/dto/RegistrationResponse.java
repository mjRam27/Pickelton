package com.pickelton.backend.registration.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.RegistrationStatus;

public record RegistrationResponse(UUID id, UUID userId, UUID tournamentId, RegistrationStatus status,
                                   OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
