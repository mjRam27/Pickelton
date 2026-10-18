package com.pickelton.backend.registration.dto;

import java.util.Map;

import jakarta.validation.constraints.Size;

// Answers keyed by registration question id. Optional for tournaments without questions.
public record RegisterRequest(@Size(max = 15) Map<String, @Size(max = 500) String> answers) {
}
