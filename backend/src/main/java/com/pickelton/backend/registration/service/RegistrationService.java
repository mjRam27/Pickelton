package com.pickelton.backend.registration.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.RegistrationMapper;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registration.entity.Registration;
import com.pickelton.backend.registration.repository.RegistrationRepository;
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
    private final CurrentUserService currentUserService;
    private final RegistrationMapper registrationMapper;

    public RegistrationResponse register(UUID tournamentId) {
        var currentUser = currentUserService.getCurrentUser();
        if (!currentUser.isPhoneVerified()) {
            throw new BadRequestException("Verify your phone number before registering for a tournament");
        }
        Tournament tournament = tournamentRepository.findByIdForRegistration(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        if (tournament.getStatus() != TournamentStatus.UPCOMING || !tournament.getStartDate().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Registration is only open for upcoming tournaments");
        }
        long activeRegistrations = registrationRepository.countByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED);
        if (activeRegistrations >= tournament.getMaxPlayers()) {
            throw new BadRequestException("Tournament is full");
        }
        Registration registration = registrationRepository.findByTournamentIdAndUserId(tournamentId, currentUser.getId())
            .orElseGet(() -> Registration.builder().user(currentUser).tournament(tournament).build());
        if (registration.getStatus() == RegistrationStatus.REGISTERED) {
            throw new BadRequestException("User is already registered for this tournament");
        }
        registration.setStatus(RegistrationStatus.REGISTERED);
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
