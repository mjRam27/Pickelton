package com.pickelton.backend.match.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateMatchScoreRequest(
    @NotNull(message = "Score 1 is required") @Min(value = 0, message = "Score cannot be negative") Integer score1,
    @NotNull(message = "Score 2 is required") @Min(value = 0, message = "Score cannot be negative") Integer score2
) {
}