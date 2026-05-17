package com.pickelton.backend.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters") String name,
    @Size(max = 50, message = "Sport type must be at most 50 characters") String sportType
) {
}
