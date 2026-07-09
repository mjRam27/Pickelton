package com.pickelton.backend.club.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record InviteClubMemberRequest(@NotNull UUID userId) {
}
