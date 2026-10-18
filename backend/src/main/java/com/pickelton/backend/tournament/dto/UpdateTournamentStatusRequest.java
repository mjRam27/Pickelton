package com.pickelton.backend.tournament.dto;

import com.pickelton.backend.enums.TournamentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTournamentStatusRequest(
    @NotNull(message = "Tournament status is required") TournamentStatus status
) {
}
