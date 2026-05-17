package com.pickelton.backend.user.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDTO(UUID id, String name, String email, String sportType, OffsetDateTime createdAt) {
}
