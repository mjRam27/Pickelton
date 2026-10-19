package com.pickelton.backend.tournament.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.club.repository.ClubRepository;
import com.pickelton.backend.club.service.ClubService;
import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.TournamentMapper;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.dto.CategoryRequest;
import com.pickelton.backend.tournament.dto.CreateTournamentRequest;
import com.pickelton.backend.tournament.dto.RegistrationQuestion;
import com.pickelton.backend.tournament.dto.TournamentResponse;
import com.pickelton.backend.tournament.dto.UpdateTournamentRequest;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.entity.TournamentCategory;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final ClubRepository clubRepository;
    private final ClubService clubService;
    private final RegistrationRepository registrationRepository;
    private final CurrentUserService currentUserService;
    private final TournamentMapper tournamentMapper;

    public TournamentResponse createTournament(CreateTournamentRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        if (!currentUser.isPhoneVerified()) {
            throw new BadRequestException("Verify your phone number before creating tournaments");
        }
        // Any player with a verified phone can host. A club is optional; if given, you must run it.
        Club club = null;
        if (request.clubId() != null) {
            club = clubRepository.findById(request.clubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
            if (!clubService.isClubAdmin(club.getId(), currentUser.getId())) {
                throw new ForbiddenException("Only a club admin can create a tournament for this club");
            }
        }
        Tournament tournament = Tournament.builder()
            .name(request.name().trim())
            .description(request.description())
            .sportType(request.sportType())
            .tournamentType(request.tournamentType())
            .status(TournamentStatus.UPCOMING)
            .createdBy(currentUser)
            .club(club)
            .entryFee(request.entryFee())
            .maxPlayers(request.maxPlayers())
            .startDate(request.startDate())
            .venue(trimToNull(request.venue()))
            .registrationDeadline(request.registrationDeadline())
            .upiId(trimToNull(request.upiId()))
            .payeeName(trimToNull(request.payeeName()))
            .paymentInstructions(trimToNull(request.paymentInstructions()))
            .registrationQuestions(request.registrationQuestions() == null ? new ArrayList<>() : new ArrayList<>(request.registrationQuestions()))
            .build();
        applyCategories(tournament, request.categories(), Map.of());
        validateRegistrationSetup(tournament);
        return tournamentMapper.toResponse(tournamentRepository.save(tournament));
    }

    @Transactional(readOnly = true)
    public PageResponse<TournamentResponse> getTournaments(TournamentStatus status, SportType sportType,
                                                             UUID clubId, int page, int size) {
        Specification<Tournament> specification = Specification.where(null);
        if (status != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (sportType != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("sportType"), sportType));
        }
        if (clubId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("club").get("id"), clubId));
        }
        var tournamentPage = tournamentRepository.findAll(specification, PageRequest.of(page, size));
        return new PageResponse<>(
            tournamentPage.getContent().stream().map(tournamentMapper::toResponse).toList(),
            tournamentPage.getNumber(), tournamentPage.getSize(), tournamentPage.getTotalElements(),
            tournamentPage.getTotalPages(), tournamentPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getMyHostedTournaments() {
        return tournamentRepository.findByCreatedByIdOrderByCreatedAtDesc(currentUserService.getUserId()).stream()
            .map(tournamentMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getByClub(UUID clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found");
        }
        return tournamentRepository.findByClubId(clubId).stream().map(tournamentMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TournamentResponse getTournament(UUID id) {
        return tournamentMapper.toResponse(requireTournament(id));
    }

    public TournamentResponse updateTournament(UUID id, UpdateTournamentRequest request) {
        Tournament tournament = requireOwnedTournament(id);
        if (tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new BadRequestException("Only upcoming tournaments can be updated");
        }
        if (request.maxPlayers() != null) {
            long registered = registrationRepository.countByTournamentIdAndStatus(id, RegistrationStatus.REGISTERED);
            if (request.maxPlayers() < registered) {
                throw new BadRequestException("Max players cannot be less than current registrations");
            }
            tournament.setMaxPlayers(request.maxPlayers());
        }
        if (request.name() != null && !request.name().isBlank()) {
            tournament.setName(request.name().trim());
        }
        if (request.description() != null) {
            tournament.setDescription(request.description().trim());
        }
        if (request.entryFee() != null) {
            tournament.setEntryFee(request.entryFee());
        }
        if (request.startDate() != null) {
            tournament.setStartDate(request.startDate());
        }
        if (request.venue() != null) {
            tournament.setVenue(trimToNull(request.venue()));
        }
        if (request.registrationDeadline() != null) {
            tournament.setRegistrationDeadline(request.registrationDeadline());
        }
        if (request.upiId() != null) {
            tournament.setUpiId(trimToNull(request.upiId()));
        }
        if (request.payeeName() != null) {
            tournament.setPayeeName(trimToNull(request.payeeName()));
        }
        if (request.paymentInstructions() != null) {
            tournament.setPaymentInstructions(trimToNull(request.paymentInstructions()));
        }
        if (request.registrationQuestions() != null) {
            if (registrationRepository.countByTournamentIdAndStatus(id, RegistrationStatus.REGISTERED) > 0) {
                throw new BadRequestException("Registration questions can't change once players have registered");
            }
            tournament.setRegistrationQuestions(new ArrayList<>(request.registrationQuestions()));
        }
        if (request.categories() != null) {
            Map<UUID, Long> registeredPerCategory = new HashMap<>();
            registrationRepository.countByCategory(id, RegistrationStatus.REGISTERED)
                .forEach(row -> registeredPerCategory.put((UUID) row[0], (Long) row[1]));
            boolean hadCategories = !tournament.getCategories().isEmpty();
            if (!hadCategories && !request.categories().isEmpty()
                && registrationRepository.countByTournamentIdAndStatus(id, RegistrationStatus.REGISTERED) > 0) {
                throw new BadRequestException("Categories can't be added once players have registered");
            }
            applyCategories(tournament, request.categories(), registeredPerCategory);
        }
        validateRegistrationSetup(tournament);
        return tournamentMapper.toResponse(tournamentRepository.save(tournament));
    }

    public TournamentResponse updateStatus(UUID id, TournamentStatus newStatus) {
        Tournament tournament = requireOwnedTournament(id);
        TournamentStatus current = tournament.getStatus();
        boolean valid = (current == TournamentStatus.UPCOMING
            && (newStatus == TournamentStatus.ONGOING || newStatus == TournamentStatus.CANCELLED))
            || (current == TournamentStatus.ONGOING
            && (newStatus == TournamentStatus.FINISHED || newStatus == TournamentStatus.CANCELLED));
        if (!valid) {
            throw new BadRequestException("Invalid tournament status transition");
        }
        tournament.setStatus(newStatus);
        if (newStatus == TournamentStatus.CANCELLED) {
            registrationRepository.findByTournamentIdAndStatus(id, RegistrationStatus.REGISTERED)
                .forEach(registration -> registration.setStatus(RegistrationStatus.CANCELLED));
        }
        return tournamentMapper.toResponse(tournamentRepository.save(tournament));
    }

    @Transactional(readOnly = true)
    public boolean isOrganizer(UUID tournamentId, UUID userId) {
        return requireTournament(tournamentId).getCreatedBy().getId().equals(userId);
    }

    // Replaces the event's categories with the requested ones, keeping existing ones (matched by id) so their
    // registrations stay attached. With categories, the event's limit is their total and its fee the lowest one.
    private static void applyCategories(Tournament tournament, List<CategoryRequest> requests, Map<UUID, Long> registered) {
        List<CategoryRequest> wanted = requests == null ? List.of() : requests;
        Set<String> names = new HashSet<>();
        for (CategoryRequest request : wanted) {
            if (!names.add(request.name().trim().toLowerCase())) {
                throw new BadRequestException("Two categories are called \"" + request.name().trim() + "\"");
            }
        }
        Map<UUID, TournamentCategory> existing = new HashMap<>();
        tournament.getCategories().forEach(category -> existing.put(category.getId(), category));
        Set<UUID> kept = new HashSet<>();
        List<TournamentCategory> result = new ArrayList<>();
        for (int index = 0; index < wanted.size(); index++) {
            CategoryRequest request = wanted.get(index);
            TournamentCategory category = request.id() != null ? existing.get(request.id()) : null;
            if (category == null) {
                category = TournamentCategory.builder().tournament(tournament).build();
            } else {
                kept.add(category.getId());
                long taken = registered.getOrDefault(category.getId(), 0L);
                if (request.maxPlayers() < taken) {
                    throw new BadRequestException(request.name().trim() + " already has " + taken + " players; the limit can't be lower");
                }
            }
            category.setName(request.name().trim());
            category.setFormat(request.format());
            category.setMaxPlayers(request.maxPlayers());
            category.setEntryFee(request.entryFee() == null ? BigDecimal.ZERO : request.entryFee());
            category.setSortOrder(index);
            result.add(category);
        }
        for (TournamentCategory category : existing.values()) {
            if (!kept.contains(category.getId()) && registered.getOrDefault(category.getId(), 0L) > 0) {
                throw new BadRequestException(category.getName() + " has players registered, so it can't be removed");
            }
        }
        tournament.getCategories().clear();
        tournament.getCategories().addAll(result);
        if (!result.isEmpty()) {
            tournament.setMaxPlayers(result.stream().mapToInt(TournamentCategory::getMaxPlayers).sum());
            tournament.setEntryFee(result.stream().map(TournamentCategory::getEntryFee).filter(Objects::nonNull)
                .min(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        }
    }

    // A paid tournament needs somewhere to pay; questions need unique ids and, for dropdowns, options.
    private static void validateRegistrationSetup(Tournament tournament) {
        boolean paid = isPositive(tournament.getEntryFee())
            || tournament.getCategories().stream().anyMatch(category -> isPositive(category.getEntryFee()));
        String upiId = tournament.getUpiId();
        LocalDateTime deadline = tournament.getRegistrationDeadline();
        LocalDateTime startDate = tournament.getStartDate();
        List<RegistrationQuestion> questions = tournament.getRegistrationQuestions();
        if (paid && (upiId == null || upiId.isBlank())) {
            throw new BadRequestException("Add a UPI ID so players can pay the entry fee");
        }
        if (deadline != null && startDate != null && deadline.isAfter(startDate)) {
            throw new BadRequestException("Registration must close before the tournament starts");
        }
        if (questions == null) {
            return;
        }
        Set<String> ids = new HashSet<>();
        for (RegistrationQuestion question : questions) {
            if (!ids.add(question.id())) {
                throw new BadRequestException("Each registration question needs a unique id");
            }
            if ("SELECT".equals(question.type()) && (question.options() == null || question.options().size() < 2)) {
                throw new BadRequestException("Dropdown question \"" + question.label() + "\" needs at least two options");
            }
        }
    }

    private static boolean isPositive(BigDecimal amount) {
        return amount != null && amount.signum() > 0;
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Tournament requireTournament(UUID id) {
        return tournamentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private Tournament requireOwnedTournament(UUID id) {
        Tournament tournament = requireTournament(id);
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage this tournament");
        }
        return tournament;
    }
}
