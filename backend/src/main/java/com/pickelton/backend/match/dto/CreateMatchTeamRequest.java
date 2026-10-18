package com.pickelton.backend.match.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record CreateMatchTeamRequest(
    @NotNull(message = "Team players are required")
    @Size(min = 1, max = 2, message = "Team must have 1 or 2 players")
    List<@NotNull(message = "Player id is required") UUID> playerIds
) {
}
