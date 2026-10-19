package com.pickelton.backend.registration.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.PaymentStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.RegistrationMapper;
import com.pickelton.backend.registration.dto.HostRegistrationResponse;
import com.pickelton.backend.registration.dto.RegisterRequest;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.ReviewPaymentRequest;
import com.pickelton.backend.registration.dto.SubmitPaymentRequest;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registration.entity.Registration;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.dto.RegistrationQuestion;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.entity.TournamentCategory;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final TournamentRepository tournamentRepository;
    private final CurrentUserService currentUserService;
    private final RegistrationMapper registrationMapper;

    public RegistrationResponse register(UUID tournamentId, RegisterRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        if (!currentUser.isPhoneVerified()) {
            throw new BadRequestException("Verify your phone number before registering for a tournament");
        }
        Tournament tournament = tournamentRepository.findByIdForRegistration(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        LocalDateTime now = LocalDateTime.now();
        if (tournament.getStatus() != TournamentStatus.UPCOMING || !tournament.getStartDate().isAfter(now)) {
            throw new BadRequestException("Registration is only open for upcoming tournaments");
        }
        if (tournament.getRegistrationDeadline() != null && now.isAfter(tournament.getRegistrationDeadline())) {
            throw new BadRequestException("Registration for this tournament has closed");
        }
        Registration registration = registrationRepository.findByTournamentIdAndUserId(tournamentId, currentUser.getId())
            .orElseGet(() -> Registration.builder().user(currentUser).tournament(tournament).build());
        if (registration.getStatus() == RegistrationStatus.REGISTERED) {
            throw new BadRequestException("You're already registered for this tournament");
        }
        List<TournamentCategory> categories = chooseCategories(tournament, request == null ? null : request.categoryIds());
        if (categories.isEmpty()) {
            long activeRegistrations = registrationRepository.countByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED);
            if (activeRegistrations >= tournament.getMaxPlayers()) {
                throw new BadRequestException("Tournament is full");
            }
        }
        Map<String, String> answers = validateAnswers(tournament.getRegistrationQuestions(),
            request == null ? null : request.answers());

        BigDecimal fee = categories.isEmpty() ? tournament.getEntryFee() : categories.stream()
            .map(TournamentCategory::getEntryFee).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        boolean paid = fee != null && fee.signum() > 0;
        registration.setStatus(RegistrationStatus.REGISTERED);
        registration.setAnswers(answers);
        registration.getCategories().clear();
        registration.getCategories().addAll(categories);
        registration.setAmountDue(paid ? fee : BigDecimal.ZERO);
        registration.setPaymentStatus(paid ? PaymentStatus.AWAITING_PAYMENT : PaymentStatus.NOT_REQUIRED);
        registration.setPaymentReference(null);
        registration.setPaymentSubmittedAt(null);
        registration.setPaymentReviewedAt(null);
        registration.setHostNote(null);
        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public Optional<RegistrationResponse> getMineFor(UUID tournamentId) {
        return registrationRepository.findByTournamentIdAndUserId(tournamentId, currentUserService.getUserId())
            .map(registrationMapper::toResponse);
    }

    public RegistrationResponse submitPayment(UUID tournamentId, SubmitPaymentRequest request) {
        Registration registration = registrationRepository
            .findByTournamentIdAndUserId(tournamentId, currentUserService.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Register for this tournament first"));
        if (registration.getStatus() != RegistrationStatus.REGISTERED) {
            throw new BadRequestException("This registration was cancelled");
        }
        PaymentStatus current = registration.getPaymentStatus();
        if (current == PaymentStatus.NOT_REQUIRED || current == PaymentStatus.CONFIRMED) {
            throw new BadRequestException(current == PaymentStatus.CONFIRMED ? "Your payment is already confirmed" : "This tournament has no entry fee");
        }
        String reference = request.reference().trim().toUpperCase();
        if (registrationRepository.existsByTournamentIdAndPaymentReferenceIgnoreCaseAndIdNot(tournamentId, reference, registration.getId())) {
            throw new BadRequestException("That payment reference was already used for another registration");
        }
        registration.setPaymentReference(reference);
        registration.setPaymentStatus(PaymentStatus.SUBMITTED);
        registration.setPaymentSubmittedAt(OffsetDateTime.now());
        registration.setPaymentReviewedAt(null);
        registration.setHostNote(null);
        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse cancelMine(UUID tournamentId) {
        Tournament tournament = requireTournament(tournamentId);
        if (tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new BadRequestException("Registration cannot be cancelled after tournament has started");
        }
        Registration registration = registrationRepository
            .findByTournamentIdAndUserId(tournamentId, currentUserService.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        registration.setStatus(RegistrationStatus.CANCELLED);
        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse cancelParticipant(UUID tournamentId, UUID userId) {
        Tournament tournament = requireTournament(tournamentId);
        requireOrganizer(tournament);
        if (tournament.getStatus() == TournamentStatus.FINISHED || tournament.getStatus() == TournamentStatus.CANCELLED) {
            throw new BadRequestException("Closed tournament registrations cannot be changed");
        }
        Registration registration = registrationRepository.findByTournamentIdAndUserId(tournamentId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        registration.setStatus(RegistrationStatus.CANCELLED);
        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<HostRegistrationResponse> getForHost(UUID tournamentId) {
        requireOrganizer(requireTournament(tournamentId));
        return registrationRepository.findByTournamentIdOrderByCreatedAtAsc(tournamentId).stream()
            .map(registrationMapper::toHostResponse).toList();
    }

    // The host confirms a payment after seeing it in their bank/UPI app, or rejects a reference that doesn't match.
    // Confirming without a submitted reference is allowed for cash paid at the venue.
    public HostRegistrationResponse reviewPayment(UUID tournamentId, UUID registrationId, ReviewPaymentRequest request) {
        requireOrganizer(requireTournament(tournamentId));
        Registration registration = registrationRepository.findById(registrationId)
            .filter(found -> found.getTournament().getId().equals(tournamentId))
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        if (registration.getStatus() != RegistrationStatus.REGISTERED || registration.getPaymentStatus() == PaymentStatus.NOT_REQUIRED) {
            throw new BadRequestException("This registration has no payment to review");
        }
        PaymentStatus decision = PaymentStatus.valueOf(request.status());
        if (decision == PaymentStatus.REJECTED && registration.getPaymentStatus() == PaymentStatus.AWAITING_PAYMENT) {
            throw new BadRequestException("The player hasn't submitted a payment reference yet");
        }
        registration.setPaymentStatus(decision);
        registration.setPaymentReviewedAt(OffsetDateTime.now());
        registration.setHostNote(request.note() == null || request.note().isBlank() ? null : request.note().trim());
        return registrationMapper.toHostResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getMine() {
        return registrationRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getUserId()).stream()
            .map(registrationMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TournamentParticipantResponse> getParticipants(UUID tournamentId) {
        requireTournament(tournamentId);
        return registrationRepository.findByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED)
            .stream().map(registrationMapper::toParticipantResponse).toList();
    }

    // For events with categories, the player must pick at least one, each from this event and not full.
    // The tournament row is locked for the whole registration, so two players can't take the last spot together.
    private List<TournamentCategory> chooseCategories(Tournament tournament, List<UUID> categoryIds) {
        if (tournament.getCategories().isEmpty()) {
            return List.of();
        }
        Set<UUID> wanted = categoryIds == null ? Set.of() : new LinkedHashSet<>(categoryIds);
        if (wanted.isEmpty()) {
            throw new BadRequestException("Choose at least one category to enter");
        }
        Map<UUID, Long> taken = new HashMap<>();
        registrationRepository.countByCategory(tournament.getId(), RegistrationStatus.REGISTERED)
            .forEach(row -> taken.put((UUID) row[0], (Long) row[1]));
        List<TournamentCategory> chosen = new ArrayList<>();
        for (TournamentCategory category : tournament.getCategories()) {
            if (!wanted.contains(category.getId())) {
                continue;
            }
            if (taken.getOrDefault(category.getId(), 0L) >= category.getMaxPlayers()) {
                throw new BadRequestException(category.getName() + " is full");
            }
            chosen.add(category);
        }
        if (chosen.size() != wanted.size()) {
            throw new BadRequestException("That category isn't part of this event");
        }
        return chosen;
    }

    // Keeps only answers to the tournament's questions and checks required, number and dropdown answers.
    private static Map<String, String> validateAnswers(List<RegistrationQuestion> questions, Map<String, String> submitted) {
        Map<String, String> answers = new LinkedHashMap<>();
        if (questions == null) {
            return answers;
        }
        for (RegistrationQuestion question : questions) {
            String value = submitted == null ? null : submitted.get(question.id());
            value = value == null ? "" : value.trim();
            if ("CHECKBOX".equals(question.type())) {
                value = "true".equalsIgnoreCase(value) ? "true" : "";
            }
            if (value.isEmpty()) {
                if (question.required()) {
                    throw new BadRequestException("Please answer: " + question.label());
                }
                continue;
            }
            if ("NUMBER".equals(question.type()) && !value.matches("^-?\\d+(\\.\\d+)?$")) {
                throw new BadRequestException("\"" + question.label() + "\" needs a number");
            }
            if ("SELECT".equals(question.type()) && (question.options() == null || !question.options().contains(value))) {
                throw new BadRequestException("Choose one of the options for \"" + question.label() + "\"");
            }
            answers.put(question.id(), value.length() > 500 ? value.substring(0, 500) : value);
        }
        return answers;
    }

    private Tournament requireTournament(UUID tournamentId) {
        return tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage registrations");
        }
    }
}
