package com.pickelton.backend.match.dto;

import java.util.UUID;

import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchParticipantStatus;

public record MatchParticipantResponse(UUID userId, String teamCode, MatchParticipantRole role,
                                       MatchParticipantStatus status) {
}
