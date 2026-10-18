package com.pickelton.backend.match.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AssignScorekeeperRequest(
    @NotNull(message = "Scorekeeper userId is required")
    UUID userId
) {
}
