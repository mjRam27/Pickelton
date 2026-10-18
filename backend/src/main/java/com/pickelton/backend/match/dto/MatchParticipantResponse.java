package com.pickelton.backend.match.dto;

import java.util.UUID;

import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.ParticipantRole;

public record MatchParticipantResponse(
    UUID id,
    UUID userId,
    String name,
    String team,
    ParticipantRole role,
    InvitationStatus invitationStatus
) {
}
