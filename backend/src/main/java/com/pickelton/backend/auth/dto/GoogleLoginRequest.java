package com.pickelton.backend.auth.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GoogleLoginRequest(
    @NotBlank(message = "Google ID token is required") String idToken,
    @Size(max = 32) @Pattern(regexp = "^$|^\\+?[1-9][0-9]{7,14}$", message = "Invalid phone number") String phoneNumber,
    @Past(message = "Date of birth must be in the past") LocalDate dateOfBirth
) {
}
