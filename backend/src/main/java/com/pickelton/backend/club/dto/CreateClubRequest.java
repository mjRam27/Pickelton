package com.pickelton.backend.club.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateClubRequest(
    @NotBlank(message = "Club name is required") String name,
    String description,
    @NotBlank(message = "Location is required") String location
) {
}