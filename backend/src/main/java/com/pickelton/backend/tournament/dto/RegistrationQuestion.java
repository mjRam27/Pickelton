package com.pickelton.backend.tournament.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// A question the host adds to the registration form, e.g. "Partner's name" or "T-shirt size".
public record RegistrationQuestion(
    @NotBlank @Size(max = 40) @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Question id may only use letters, numbers, - and _") String id,
    @NotBlank @Size(max = 160) String label,
    @NotBlank @Pattern(regexp = "^(TEXT|NUMBER|SELECT|CHECKBOX)$", message = "Question type must be TEXT, NUMBER, SELECT or CHECKBOX") String type,
    boolean required,
    @Size(max = 20) List<@Size(max = 80) String> options
) {
}
