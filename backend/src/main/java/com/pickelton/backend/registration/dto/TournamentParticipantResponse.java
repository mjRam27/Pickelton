package com.pickelton.backend.registration.dto;

import java.util.UUID;

import com.pickelton.backend.enums.RegistrationStatus;

public record TournamentParticipantResponse(UUID registrationId, UUID userId, String name, String email,
                                            String sportType, RegistrationStatus status) {
}
