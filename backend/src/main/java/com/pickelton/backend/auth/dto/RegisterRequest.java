package com.pickelton.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Name is required") @Size(max = 100, message = "Name must be at most 100 characters") String name,
    @Email(message = "Invalid email") @NotBlank(message = "Email is required") @Size(max = 255) String email,
    @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password,
    @Size(max = 50, message = "Sport type must be at most 50 characters") String sportType
) {
}
