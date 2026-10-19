package com.pickelton.backend.registration.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Host's decision after checking the payment against their bank or UPI app.
public record ReviewPaymentRequest(
    @NotNull @Pattern(regexp = "^(CONFIRMED|REJECTED)$", message = "Status must be CONFIRMED or REJECTED") String status,
    @Size(max = 300) String note
) {
}
