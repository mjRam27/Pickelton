package com.pickelton.backend.registrationform.dto;

import java.util.List;

import jakarta.validation.Valid;

public record SubmitRegistrationRequest(List<@Valid RegistrationAnswerRequest> answers) {
}
