package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.pickelton.backend.enums.TournamentType;

// registeredCount counts active registrations in this category.
public record CategoryResponse(UUID id, String name, TournamentType format, Integer maxPlayers, BigDecimal entryFee,
                               long registeredCount) {
}
