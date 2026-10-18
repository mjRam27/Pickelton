package com.pickelton.backend.enums;

// Entry-fee payment state of a registration. Payments go straight to the host (UPI); the host confirms them.
public enum PaymentStatus {
    NOT_REQUIRED,
    AWAITING_PAYMENT,
    SUBMITTED,
    CONFIRMED,
    REJECTED
}
