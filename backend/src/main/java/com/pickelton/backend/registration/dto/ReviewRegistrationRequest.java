package com.pickelton.backend.registration.dto;

import com.pickelton.backend.enums.RegistrationStatus;
import jakarta.validation.constraints.NotNull;

public record ReviewRegistrationRequest(@NotNull RegistrationStatus status) {
}
