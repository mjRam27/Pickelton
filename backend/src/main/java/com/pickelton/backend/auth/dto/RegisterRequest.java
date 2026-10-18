package com.pickelton.backend.auth.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Name is required") @Size(max = 100, message = "Name must be at most 100 characters") String name,
    @Email(message = "Invalid email") @NotBlank(message = "Email is required") @Size(max = 255) String email,
    @NotBlank(message = "Phone number is required") @Size(max = 32) @Pattern(regexp = "^\\+?[1-9][0-9]{7,14}$", message = "Invalid phone number") String phoneNumber,
    @NotNull(message = "Date of birth is required") @Past(message = "Date of birth must be in the past") LocalDate dateOfBirth,
    @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password
) {

    @AssertTrue(message = "You must be at least 13 years old to register")
    public boolean isOldEnough() {
        return dateOfBirth != null && !dateOfBirth.isAfter(LocalDate.now().minusYears(13));
    }
}
