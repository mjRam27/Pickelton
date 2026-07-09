package com.pickelton.backend.analytics.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.analytics.entity.PlayerStats;
import com.pickelton.backend.enums.SportType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerStatsRepository extends JpaRepository<PlayerStats, UUID> {

    Optional<PlayerStats> findByUserIdAndSportType(UUID userId, SportType sportType);

    List<PlayerStats> findTop50BySportTypeOrderByRatingDescWinsDesc(SportType sportType);
}
