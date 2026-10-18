package com.pickelton.backend.match.dto;

import java.util.UUID;

public record ScorekeeperSearchResponse(
    UUID userId,
    String name,
    String email,
    String phoneNumber
) {
}
