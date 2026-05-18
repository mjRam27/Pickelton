package com.pickelton.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyCodeRequest(
    @NotBlank(message = "Code is required") @Size(min = 4, max = 8) String code
) {
}
