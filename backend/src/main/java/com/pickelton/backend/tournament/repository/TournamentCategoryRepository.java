package com.pickelton.backend.tournament.repository;

import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.tournament.entity.TournamentCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentCategoryRepository extends JpaRepository<TournamentCategory, UUID> {

    Optional<TournamentCategory> findByIdAndTournamentId(UUID id, UUID tournamentId);
}
