package com.pickelton.backend.mapper;

import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registration.entity.Registration;
import org.springframework.stereotype.Component;

@Component
public class RegistrationMapper {

    public RegistrationResponse toResponse(Registration registration) {
        return new RegistrationResponse(
            registration.getId(),
            registration.getUser().getId(),
            registration.getTournament().getId(),
            registration.getStatus(),
            registration.getCreatedAt(),
            registration.getUpdatedAt()
        );
    }

    public TournamentParticipantResponse toParticipantResponse(Registration registration) {
        return new TournamentParticipantResponse(
            registration.getId(),
            registration.getUser().getId(),
            registration.getUser().getName(),
            registration.getUser().getEmail(),
            registration.getUser().getSportType(),
            RegistrationStatus.REGISTERED
        );
    }
}