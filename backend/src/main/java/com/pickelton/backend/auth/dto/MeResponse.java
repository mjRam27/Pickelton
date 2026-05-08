package com.pickelton.backend.auth.dto;

import com.pickelton.backend.user.dto.UserResponse;

public record MeResponse(UserResponse user) {
}