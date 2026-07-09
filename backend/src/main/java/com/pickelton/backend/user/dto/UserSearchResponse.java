package com.pickelton.backend.user.dto;

import java.util.List;
import java.util.UUID;

public record UserSearchResponse(UUID userId, String name, String avatarUrl, String city, List<String> clubNames) {
}
