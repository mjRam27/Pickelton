package com.pickelton.backend.registrationform.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.enums.FormStatus;
import com.pickelton.backend.registrationform.entity.TournamentRegistrationForm;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRegistrationFormRepository extends JpaRepository<TournamentRegistrationForm, UUID> {

    List<TournamentRegistrationForm> findByTournamentIdOrderByVersionDesc(UUID tournamentId);

    Optional<TournamentRegistrationForm> findFirstByTournamentIdAndStatusOrderByVersionDesc(UUID tournamentId, FormStatus status);

    Optional<TournamentRegistrationForm> findFirstByTournamentIdOrderByVersionDesc(UUID tournamentId);
}
