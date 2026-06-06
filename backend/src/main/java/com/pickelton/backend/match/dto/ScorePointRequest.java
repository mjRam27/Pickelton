package com.pickelton.backend.match.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ScorePointRequest(
    @NotBlank(message = "Team is required") @Size(max = 20, message = "Team must be at most 20 characters") String team,
    @Min(value = 1, message = "Points must be at least 1") Integer points
) {
}
