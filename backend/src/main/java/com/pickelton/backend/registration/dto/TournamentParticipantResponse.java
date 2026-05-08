package com.pickelton.backend.registration.dto;

import java.util.UUID;

import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.SportType;

public record TournamentParticipantResponse(UUID registrationId, UUID userId, String name, String email,
                                            SportType sportType, RegistrationStatus status) {
}