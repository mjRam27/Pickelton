package com.pickelton.backend.match.repository;

import java.util.UUID;

import com.pickelton.backend.match.entity.ScoreHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, UUID> {
}
