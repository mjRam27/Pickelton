package com.pickelton.backend.user.dto;

import java.util.UUID;

public record UserStatsDTO(UUID userId, long wins, long losses, long totalMatches) {
}
