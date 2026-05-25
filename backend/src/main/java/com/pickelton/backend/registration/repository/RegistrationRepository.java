package com.pickelton.backend.registration.repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.registration.entity.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    boolean existsByTournamentIdAndUserId(UUID tournamentId, UUID userId);

    boolean existsByTournamentIdAndUserIdAndStatus(UUID tournamentId, UUID userId, RegistrationStatus status);

    Optional<Registration> findByTournamentIdAndUserId(UUID tournamentId, UUID userId);

    long countByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);

    List<Registration> findByTournamentId(UUID tournamentId);

    List<Registration> findByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);

    List<Registration> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
