package com.pickelton.backend.registrationform.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.FormStatus;

public record RegistrationFormResponse(
    UUID id,
    UUID tournamentId,
    Integer version,
    FormStatus status,
    List<FormFieldResponse> fields,
    OffsetDateTime publishedAt,
    OffsetDateTime createdAt
) {
}
