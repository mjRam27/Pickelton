package com.pickelton.backend.analytics.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.analytics.entity.ClubStats;
import com.pickelton.backend.enums.SportType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubStatsRepository extends JpaRepository<ClubStats, UUID> {

    Optional<ClubStats> findByClubIdAndSportType(UUID clubId, SportType sportType);

    List<ClubStats> findTop50BySportTypeOrderByClubRatingDescWinsDesc(SportType sportType);
}
