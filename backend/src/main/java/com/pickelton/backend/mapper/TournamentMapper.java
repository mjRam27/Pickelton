package com.pickelton.backend.mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.dto.CategoryResponse;
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
        Map<UUID, Long> perCategory = new HashMap<>();
        if (tournament.getId() != null && !tournament.getCategories().isEmpty()) {
            registrationRepository.countByCategory(tournament.getId(), RegistrationStatus.REGISTERED)
                .forEach(row -> perCategory.put((UUID) row[0], (Long) row[1]));
        }
        List<CategoryResponse> categories = tournament.getCategories().stream()
            .map(category -> new CategoryResponse(category.getId(), category.getName(), category.getFormat(),
                category.getMaxPlayers(), category.getEntryFee(), perCategory.getOrDefault(category.getId(), 0L)))
            .toList();
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
            categories,
            registered,
            tournament.getCreatedAt(),
            tournament.getUpdatedAt()
        );
    }
}
