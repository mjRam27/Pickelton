package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateTournamentRequest(
    @Size(min = 1, max = 255, message = "Tournament name must be between 1 and 255 characters") String name,
    @Size(max = 3000, message = "Description must be at most 3000 characters") String description,
    @PositiveOrZero(message = "Entry fee cannot be negative") BigDecimal entryFee,
    @Min(value = 2, message = "Max players must be at least 2") Integer maxPlayers,
    @Future(message = "Start date must be in the future") LocalDateTime startDate
) {
}
