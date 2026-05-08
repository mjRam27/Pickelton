package com.pickelton.backend.registration.service;

import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.RegistrationStatus;
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

import java.util.List;

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
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (registrationRepository.existsByTournamentIdAndUserId(tournamentId, currentUser.getId())) {
            throw new BadRequestException("User is already registered for this tournament");
        }

        long activeRegistrations = registrationRepository.countByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED);
        if (tournament.getMaxPlayers() != null && activeRegistrations >= tournament.getMaxPlayers()) {
            throw new BadRequestException("Tournament is full");
        }

        Registration registration = Registration.builder()
            .user(currentUser)
            .tournament(tournament)
            .status(RegistrationStatus.REGISTERED)
            .build();

        return registrationMapper.toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<TournamentParticipantResponse> getParticipants(UUID tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResourceNotFoundException("Tournament not found");
        }

        return registrationRepository.findByTournamentIdAndStatus(tournamentId, RegistrationStatus.REGISTERED)
            .stream()
            .map(registrationMapper::toParticipantResponse)
            .toList();
    }
}