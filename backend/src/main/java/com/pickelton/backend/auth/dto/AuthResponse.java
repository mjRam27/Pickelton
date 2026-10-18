package com.pickelton.backend.auth.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AuthResponse(String token, String refreshToken, long accessTokenExpiresInMs,
                           long refreshTokenExpiresInMs, UUID userId, String name, String email,
                           String phoneNumber, LocalDate dateOfBirth, boolean emailVerified,
                           boolean phoneVerified) {
}
