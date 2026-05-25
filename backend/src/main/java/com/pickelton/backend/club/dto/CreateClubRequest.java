package com.pickelton.backend.club.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateClubRequest(
    @NotBlank(message = "Club name is required") @Size(max = 255) String name,
    @Size(max = 2000) String description,
    @NotBlank(message = "Location is required") @Size(max = 255) String location
) {
}
