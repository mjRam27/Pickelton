package com.pickelton.backend.tournament.dto;

import java.util.UUID;

// The categories a player entered, as shown on their registration.
public record CategorySummary(UUID id, String name) {
}
