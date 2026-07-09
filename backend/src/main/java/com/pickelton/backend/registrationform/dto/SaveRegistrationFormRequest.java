package com.pickelton.backend.registrationform.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record SaveRegistrationFormRequest(@NotEmpty List<@Valid FormFieldRequest> fields) {
}
