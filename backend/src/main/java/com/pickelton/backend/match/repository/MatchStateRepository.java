package com.pickelton.backend.match.repository;

import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.match.entity.MatchState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchStateRepository extends JpaRepository<MatchState, UUID> {

    Optional<MatchState> findByMatchId(UUID matchId);
}
