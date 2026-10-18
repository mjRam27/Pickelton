package com.pickelton.backend.mapper;

import java.util.List;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.dto.TournamentResponse;
import com.pickelton.backend.tournament.entity.Tournament;
import org.springframework.stereotype.Component;

@Component
public class TournamentMapper {

    private final UserMapper userMapper;
    private final RegistrationRepository registrationRepository;

    public TournamentMapper(UserMapper userMapper, RegistrationRepository registrationRepository) {
        this.userMapper = userMapper;
        this.registrationRepository = registrationRepository;
    }

    public TournamentResponse toResponse(Tournament tournament) {
        Club club = tournament.getClub();
        long registered = tournament.getId() == null ? 0
            : registrationRepository.countByTournamentIdAndStatus(tournament.getId(), RegistrationStatus.REGISTERED);
        return new TournamentResponse(
            tournament.getId(),
            tournament.getName(),
            tournament.getDescription(),
            tournament.getSportType(),
            tournament.getTournamentType(),
            tournament.getStatus(),
            userMapper.toPublicSummary(tournament.getCreatedBy()),
            club != null ? club.getId() : null,
            club != null ? club.getName() : null,
            tournament.getEntryFee(),
            tournament.getMaxPlayers(),
            tournament.getStartDate(),
            tournament.getVenue(),
            tournament.getRegistrationDeadline(),
            tournament.getUpiId(),
            tournament.getPayeeName(),
            tournament.getPaymentInstructions(),
            tournament.getRegistrationQuestions() == null ? List.of() : tournament.getRegistrationQuestions(),
            registered,
            tournament.getCreatedAt(),
            tournament.getUpdatedAt()
        );
    }
}
