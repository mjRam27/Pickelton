package com.pickelton.backend.club.dto;

import java.util.UUID;

import com.pickelton.backend.enums.ClubRole;

public record ClubMemberResponse(UUID id, UUID clubId, UUID userId, ClubRole role) {
}