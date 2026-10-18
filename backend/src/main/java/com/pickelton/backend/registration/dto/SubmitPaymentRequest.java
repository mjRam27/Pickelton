package com.pickelton.backend.registration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// The UPI transaction reference (UTR, usually 12 digits) shown in the player's payment app.
public record SubmitPaymentRequest(
    @NotBlank(message = "Enter the UPI transaction reference")
    @Pattern(regexp = "^[A-Za-z0-9]{6,35}$", message = "The reference should be the 12-digit UTR from your UPI app")
    String reference
) {
}
