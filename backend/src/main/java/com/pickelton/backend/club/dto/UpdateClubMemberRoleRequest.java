package com.pickelton.backend.club.dto;

import com.pickelton.backend.enums.ClubRole;
import jakarta.validation.constraints.NotNull;

public record UpdateClubMemberRoleRequest(
    @NotNull(message = "Role is required") ClubRole role
) {
}
