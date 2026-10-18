package com.pickelton.backend.club.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record UpdateClubRequest(
    @Size(min = 1, max = 255, message = "Club name must be between 1 and 255 characters") String name,
    @Size(max = 2000, message = "Description must be at most 2000 characters") String description,
    @Size(min = 1, max = 255, message = "Location must be between 1 and 255 characters") String location,
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90") Double latitude,
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180") Double longitude
) {
}
