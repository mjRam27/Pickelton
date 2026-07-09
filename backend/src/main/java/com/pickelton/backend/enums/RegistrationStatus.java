package com.pickelton.backend.enums;

public enum RegistrationStatus {
    SUBMITTED,
    APPROVED,
    REJECTED,
    WAITLISTED,
    // Legacy status kept while existing clients migrate.
    REGISTERED,
    CANCELLED
}
