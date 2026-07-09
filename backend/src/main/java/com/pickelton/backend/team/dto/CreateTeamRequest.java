package com.pickelton.backend.team.dto;

import com.pickelton.backend.enums.SportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(
    @NotBlank @Size(max = 160) String name,
    @NotNull SportType sportType
) {
}
