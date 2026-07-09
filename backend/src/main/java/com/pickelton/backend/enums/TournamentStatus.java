package com.pickelton.backend.enums;

public enum TournamentStatus {
    DRAFT,
    REGISTRATION_OPEN,
    REGISTRATION_CLOSED,
    LIVE,
    COMPLETED,
    ARCHIVED,
    // Legacy statuses kept while existing clients migrate.
    UPCOMING,
    ONGOING,
    FINISHED,
    CANCELLED
}
