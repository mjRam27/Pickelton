package com.pickelton.backend.match.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.match.entity.TournamentMatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, UUID> {

    Optional<TournamentMatch> findByMatchId(UUID matchId);

    List<TournamentMatch> findByTournamentIdOrderByDisplayOrderAscCreatedAtAsc(UUID tournamentId);

    long countByTournamentId(UUID tournamentId);
}
