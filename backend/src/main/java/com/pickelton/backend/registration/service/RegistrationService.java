package com.pickelton.backend.registration.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.RegistrationMapper;
import com.pickelton.backend.registration.dto.ReviewRegistrationRequest;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registration.entity.Registration;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.registrationform.dto.RegistrationAnswerRequest;
import com.pickelton.backend.registrationform.dto.SubmitRegistrationRequest;
import com.pickelton.backend.registrationform.entity.RegistrationAnswer;
import com.pickelton.backend.registrationform.entity.TournamentRegistrationForm;
import com.pickelton.backend.registrationform.repository.RegistrationAnswerRepository;
import com.pickelton.backend.registrationform.repository.RegistrationFormFieldRepository;
import com.pickelton.backend.registrationform.repository.TournamentRegistrationFormRepository;
import com.pickelton.backend.tournament.entity.Tournament;
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
    private final TournamentRegistrationFormRepository formRepository;
    private final RegistrationFormFieldRepository fieldRepository;
    private final RegistrationAnswerRepository answerRepository;
    private final CurrentUserService currentUserService;
    private final RegistrationMapper registrationMapper;

    public RegistrationResponse register(UUID tournamentId) {
        return submit(tournamentId, new SubmitRegistrationRequest(List.of()));
    }

    public RegistrationResponse submit(UUID tournamentId, SubmitRegistrationRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        if (!currentUser.isPhoneVerified()) {
            throw new BadRequestException("Verify your phone number before registering for a tournament");
        }
        Tournament tournament = tournamentRepository.findByIdForRegistration(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (!isRegistrationOpen(tournament) || !tournament.getStartDate().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Registration is only open for registration-open tournaments");
        }
        long activeRegistrations = registrationRepository.countByTournamentIdAndStatus(tournamentId, RegistrationStatus.APPROVED)
            + registrationRepository.countByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED);
        if (activeRegistrations >= tournament.getMaxPlayers()) {
            throw new BadRequestException("Tournament is full");
        }
        Registration registration = registrationRepository.findByTournamentIdAndUserId(tournamentId, currentUser.getId())
            .orElseGet(() -> Registration.builder().user(currentUser).tournament(tournament).build());
        if (registration.getStatus() == RegistrationStatus.APPROVED || registration.getStatus() == RegistrationStatus.REGISTERED) {
            throw new BadRequestException("User is already registered for this tournament");
        }
        TournamentRegistrationForm form = formRepository.findFirstByTournamentIdAndStatusOrderByVersionDesc(tournamentId, com.pickelton.backend.enums.FormStatus.PUBLISHED)
            .orElse(null);
        registration.setStatus(RegistrationStatus.SUBMITTED);
        registration.setForm(form);
        registration.setSubmittedAt(OffsetDateTime.now());
        Registration saved = registrationRepository.save(registration);
        if (form != null) {
            saveAnswers(saved, form, request.answers() == null ? List.of() : request.answers());
        }
        return registrationMapper.toResponse(saved);
    }

    public RegistrationResponse cancelMine(UUID tournamentId) {
        Tournament tournament = requireTournament(tournamentId);
        if (!isRegistrationOpen(tournament)) {
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
        if (tournament.getStatus() == TournamentStatus.COMPLETED
            || tournament.getStatus() == TournamentStatus.FINISHED
            || tournament.getStatus() == TournamentStatus.CANCELLED) {
            throw new BadRequestException("Closed tournament registrations cannot be changed");
        }
        Registration registration = registrationRepository.findByTournamentIdAndUserId(tournamentId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        registration.setStatus(RegistrationStatus.CANCELLED);
        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse review(UUID tournamentId, UUID registrationId, ReviewRegistrationRequest request) {
        Tournament tournament = requireTournament(tournamentId);
        requireOrganizer(tournament);
        if (request.status() != RegistrationStatus.APPROVED
            && request.status() != RegistrationStatus.REJECTED
            && request.status() != RegistrationStatus.WAITLISTED) {
            throw new BadRequestException("Registration can only be approved, rejected, or waitlisted");
        }
        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        if (!registration.getTournament().getId().equals(tournamentId)) {
            throw new BadRequestException("Registration does not belong to this tournament");
        }
        registration.setStatus(request.status());
        registration.setReviewedBy(currentUserService.getCurrentUser());
        registration.setReviewedAt(OffsetDateTime.now());
        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getMine() {
        return registrationRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getUserId()).stream()
            .map(registrationMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TournamentParticipantResponse> getParticipants(UUID tournamentId) {
        requireTournament(tournamentId);
        return Stream.concat(
                registrationRepository.findByTournamentId(tournamentId).stream()
                    .filter(registration -> registration.getStatus() == RegistrationStatus.SUBMITTED
                        || registration.getStatus() == RegistrationStatus.APPROVED
                        || registration.getStatus() == RegistrationStatus.REJECTED
                        || registration.getStatus() == RegistrationStatus.WAITLISTED),
                registrationRepository.findByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED).stream()
            )
            .map(registrationMapper::toParticipantResponse).toList();
    }

    private void saveAnswers(Registration registration, TournamentRegistrationForm form, List<RegistrationAnswerRequest> answers) {
        var fields = fieldRepository.findByFormIdOrderByDisplayOrderAsc(form.getId());
        var answerByField = answers.stream().collect(java.util.stream.Collectors.toMap(RegistrationAnswerRequest::fieldId, answer -> answer));
        for (var field : fields) {
            var answer = answerByField.get(field.getId());
            if (field.isRequired() && (answer == null || answer.value() == null || answer.value().isEmpty())) {
                throw new BadRequestException("Required field missing: " + field.getLabel());
            }
            if (answer != null) {
                answerRepository.save(RegistrationAnswer.builder()
                    .registration(registration)
                    .field(field)
                    .value(answer.value() == null ? new LinkedHashMap<>() : answer.value())
                    .build());
            }
        }
    }

    private boolean isRegistrationOpen(Tournament tournament) {
        return tournament.getStatus() == TournamentStatus.REGISTRATION_OPEN
            || tournament.getStatus() == TournamentStatus.UPCOMING;
    }

    private Tournament requireTournament(UUID tournamentId) {
        return tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage participants");
        }
    }
}
