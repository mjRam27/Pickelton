package com.pickelton.backend.registration.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.PaymentStatus;
import com.pickelton.backend.enums.RegistrationStatus;

// What the host sees for each registration: contact details, form answers and payment to verify.
public record HostRegistrationResponse(UUID id, UUID userId, String name, String email, String phoneNumber,
                                       RegistrationStatus status, Map<String, String> answers,
                                       PaymentStatus paymentStatus, BigDecimal amountDue, String paymentReference,
                                       OffsetDateTime paymentSubmittedAt, OffsetDateTime paymentReviewedAt,
                                       String hostNote, OffsetDateTime createdAt) {
}
