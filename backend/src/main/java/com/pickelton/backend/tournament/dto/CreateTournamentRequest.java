package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateTournamentRequest(
    @NotBlank(message = "Tournament name is required") String name,
    String description,
    @NotNull(message = "Sport type is required") SportType sportType,
    @NotNull(message = "Tournament type is required") TournamentType tournamentType,
    UUID clubId,
    @PositiveOrZero(message = "Entry fee cannot be negative") BigDecimal entryFee,
    @NotNull(message = "Max players is required") @Min(value = 2, message = "Max players must be at least 2") Integer maxPlayers,
    @NotNull(message = "Start date is required") LocalDateTime startDate
) {
}