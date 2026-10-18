package com.pickelton.backend.registration.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.Size;

// Answers keyed by registration question id, plus the categories entered (for events with categories).
// Both are optional for events without questions or categories.
public record RegisterRequest(@Size(max = 15) Map<String, @Size(max = 500) String> answers,
                              @Size(max = 12) List<UUID> categoryIds) {
}
