package com.pickelton.backend.match.dto;

import com.pickelton.backend.enums.GameType;
import com.pickelton.backend.enums.MatchMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.util.UUID;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateMatchRequest(
    @NotNull(message = "Match mode is required") MatchMode mode,
    @NotNull(message = "Game type is required") GameType gameType,
    UUID tournamentId,
    UUID scorekeeperId,
    @NotNull(message = "Points to win is required")
    @Min(value = 11, message = "Points to win must be at least 11") Integer pointsToWin,
    @NotNull(message = "Best of is required") Integer bestOf,
    @NotNull(message = "Win by two is required") Boolean winByTwo,
    @NotNull(message = "Teams are required")
    @Size(min = 2, max = 2, message = "Exactly 2 teams are required")
    List<@Valid CreateMatchTeamRequest> teams
) {
}
