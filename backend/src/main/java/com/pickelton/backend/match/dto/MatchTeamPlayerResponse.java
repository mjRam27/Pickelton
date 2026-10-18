package com.pickelton.backend.match.dto;

import java.util.UUID;

public record MatchTeamPlayerResponse(UUID userId, String name, Integer slotNo) {
}
