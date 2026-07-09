package com.pickelton.backend.club.dto;

import jakarta.validation.constraints.Size;

public record UpdateClubRequest(
    @Size(min = 1, max = 255, message = "Club name must be between 1 and 255 characters") String name,
    @Size(max = 2000, message = "Description must be at most 2000 characters") String description,
    @Size(min = 1, max = 255, message = "Location must be between 1 and 255 characters") String location,
    @Size(max = 100, message = "City must be at most 100 characters") String city,
    @Size(max = 1000, message = "Logo URL must be at most 1000 characters") String logoUrl
) {
}
