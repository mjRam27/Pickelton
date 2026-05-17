package com.pickelton.backend.auth.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MeResponse(UUID id, String name, String email, String sportType, OffsetDateTime createdAt) {
}
