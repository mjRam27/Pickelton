package com.pickelton.backend.match.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddPointRequest(
    @NotBlank(message = "Team code is required")
    @Size(max = 10, message = "Team code must be at most 10 characters")
    String teamCode
) {
}
