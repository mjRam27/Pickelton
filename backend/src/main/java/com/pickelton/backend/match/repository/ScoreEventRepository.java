package com.pickelton.backend.match.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.match.entity.ScoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreEventRepository extends JpaRepository<ScoreEvent, UUID> {

    long countByMatchId(UUID matchId);

    List<ScoreEvent> findByMatchIdOrderBySequenceNumberAsc(UUID matchId);
}
