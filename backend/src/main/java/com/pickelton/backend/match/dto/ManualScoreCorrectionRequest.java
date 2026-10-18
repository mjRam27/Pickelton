package com.pickelton.backend.match.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ManualScoreCorrectionRequest(
    @NotNull(message = "Score A is required")
    @Min(value = 0, message = "Score cannot be negative")
    Integer scoreA,
    @NotNull(message = "Score B is required")
    @Min(value = 0, message = "Score cannot be negative")
    Integer scoreB,
    @NotBlank(message = "Correction reason is required")
    @Size(max = 500, message = "Correction reason must be at most 500 characters")
    String reason
) {
}
