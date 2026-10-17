package com.pickelton.backend.club.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record CreateClubRequest(
    @NotBlank(message = "Club name is required") @Size(max = 255) String name,
    @Size(max = 2000) String description,
    @NotBlank(message = "Location is required") @Size(max = 255) String location,
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90") Double latitude,
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180") Double longitude
) {
}
