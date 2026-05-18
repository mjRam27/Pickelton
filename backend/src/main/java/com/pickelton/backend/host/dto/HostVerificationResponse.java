package com.pickelton.backend.host.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.HostVerificationStatus;
import com.pickelton.backend.enums.IdDocumentType;

public record HostVerificationResponse(
    UUID id,
    UUID userId,
    String legalName,
    LocalDate dateOfBirth,
    String phoneNumber,
    String addressLine1,
    String addressLine2,
    String city,
    String stateRegion,
    String postalCode,
    IdDocumentType idDocumentType,
    String idDocumentNumberLast4,
    String documentImageUrl,
    String selfieWithDocumentUrl,
    HostVerificationStatus status,
    OffsetDateTime submittedAt,
    OffsetDateTime reviewedAt,
    String rejectionReason,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
