package com.pickelton.backend.team.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record InviteTeamMemberRequest(@NotNull UUID userId) {
}
