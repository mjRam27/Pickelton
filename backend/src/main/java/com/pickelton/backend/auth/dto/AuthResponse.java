package com.pickelton.backend.auth.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AuthResponse(String token, UUID userId, String name, String email, String phoneNumber,
                           LocalDate dateOfBirth, boolean emailVerified, boolean phoneVerified) {
}
