package com.pickelton.backend.user.dto;

import java.util.UUID;

public record UserSearchResponse(UUID userId, String name, String email, String phoneNumber) {
}
