package com.pickelton.backend.registrationform.dto;

import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.FormFieldType;

public record FormFieldResponse(
    UUID id,
    String fieldKey,
    String label,
    FormFieldType type,
    String placeholder,
    String helpText,
    boolean required,
    boolean enabled,
    Integer displayOrder,
    Map<String, Object> defaultValue,
    Map<String, Object> validationRules,
    Map<String, Object> options
) {
}
