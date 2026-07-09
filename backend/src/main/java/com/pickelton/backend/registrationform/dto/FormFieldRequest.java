package com.pickelton.backend.registrationform.dto;

import java.util.Map;

import com.pickelton.backend.enums.FormFieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FormFieldRequest(
    @NotBlank @Size(max = 100) String fieldKey,
    @NotBlank @Size(max = 160) String label,
    @NotNull FormFieldType type,
    @Size(max = 255) String placeholder,
    @Size(max = 500) String helpText,
    boolean required,
    boolean enabled,
    @NotNull Integer displayOrder,
    Map<String, Object> defaultValue,
    Map<String, Object> validationRules,
    Map<String, Object> options
) {
}
