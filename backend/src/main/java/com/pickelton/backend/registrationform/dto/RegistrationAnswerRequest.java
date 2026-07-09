package com.pickelton.backend.registrationform.dto;

import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record RegistrationAnswerRequest(@NotNull UUID fieldId, @NotNull Map<String, Object> value) {
}
