package com.pickelton.backend.registration.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.PaymentStatus;
import com.pickelton.backend.enums.RegistrationStatus;

// A player's own registration, including where their payment stands.
public record RegistrationResponse(UUID id, UUID userId, UUID tournamentId, String tournamentName, RegistrationStatus status,
                                   Map<String, String> answers, PaymentStatus paymentStatus, BigDecimal amountDue,
                                   String paymentReference, String hostNote,
                                   OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
