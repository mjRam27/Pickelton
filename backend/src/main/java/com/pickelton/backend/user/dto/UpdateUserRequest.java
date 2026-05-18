package com.pickelton.backend.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters") String name,
    @Size(max = 32) @Pattern(regexp = "^$|^\\+?[1-9][0-9]{7,14}$", message = "Invalid phone number") String phoneNumber
) {
}
