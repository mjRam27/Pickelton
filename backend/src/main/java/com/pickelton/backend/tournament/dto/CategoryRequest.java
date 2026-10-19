package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.pickelton.backend.enums.TournamentType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// A category in the host's create/edit form. id is set when editing an existing category.
public record CategoryRequest(
    UUID id,
    @NotBlank(message = "Category name is required") @Size(max = 80) String name,
    @NotNull(message = "Choose singles or doubles for each category") TournamentType format,
    @NotNull(message = "Each category needs a player limit") @Min(value = 2, message = "A category needs room for at least 2 players")
    @Max(value = 512, message = "A category can have at most 512 players") Integer maxPlayers,
    @PositiveOrZero(message = "Entry fee cannot be negative") BigDecimal entryFee
) {
}
