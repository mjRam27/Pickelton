package com.pickelton.backend.match.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.match.entity.ScoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreEventRepository extends JpaRepository<ScoreEvent, UUID> {

    long countByMatchId(UUID matchId);

    Optional<ScoreEvent> findTopByMatchIdOrderBySequenceNumberDesc(UUID matchId);

    List<ScoreEvent> findByMatchIdOrderBySequenceNumberDesc(UUID matchId);
}
