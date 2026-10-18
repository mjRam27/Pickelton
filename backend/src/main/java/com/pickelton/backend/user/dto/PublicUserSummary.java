package com.pickelton.backend.user.dto;

import java.util.UUID;

public record PublicUserSummary(UUID id, String name, String avatarUrl, String city) {
}
