package com.pickelton.backend.auth.dto;

import com.pickelton.backend.enums.SportType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
    @NotBlank(message = "Name is required") String name,
    @Email(message = "Invalid email") @NotBlank(message = "Email is required") String email,
    @NotBlank(message = "Password is required") String password,
    @NotNull(message = "Sport type is required") SportType sportType
) {
}