package com.pickelton.backend.user.dto;

import java.util.UUID;

// reason is RECENT_PLAYER, NEARBY or COMMUNITY.
public record PlayerSuggestionResponse(UUID userId, String name, String avatarUrl, String city, String lastPlayedAt,
                                       boolean following, String reason) {
}
