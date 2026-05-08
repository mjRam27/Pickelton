package com.pickelton.backend.auth.dto;

import com.pickelton.backend.user.dto.UserResponse;

public record AuthResponse(String tokenType, String accessToken, UserResponse user) {
}