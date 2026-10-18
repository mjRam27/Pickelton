package com.pickelton.backend.match.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateMatchScoreRequest(
    @NotNull(message = "Score 1 is required") @Min(value = 0, message = "Score cannot be negative") Integer score1,
    @NotNull(message = "Score 2 is required") @Min(value = 0, message = "Score cannot be negative") Integer score2,
    @Size(max = 20, message = "Team must be at most 20 characters") String team,
    @Min(value = 1, message = "Delta must be at least 1") Integer delta
) {
}
