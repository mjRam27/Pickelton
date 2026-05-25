package com.pickelton.backend.match.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMatchRequest(
    @NotNull(message = "Tournament is required") UUID tournamentId,
    @NotNull(message = "Player 1 is required") UUID player1Id,
    @NotNull(message = "Player 2 is required") UUID player2Id,
    @NotBlank(message = "Round is required") @Size(max = 50, message = "Round must be at most 50 characters") String round
) {
}
