package com.pickelton.backend.club.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.club.entity.Club;

public interface ClubRepository extends JpaRepository<Club, UUID> {
    Page<Club> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location, Pageable pageable);

    // Nearest first (great-circle distance); clubs without coordinates go last.
    @Query(value = """
        SELECT c.* FROM clubs c
        WHERE c.name ILIKE :pattern OR c.location ILIKE :pattern
        ORDER BY (c.latitude IS NULL OR c.longitude IS NULL),
                 6371 * acos(LEAST(1, cos(radians(:latitude)) * cos(radians(c.latitude))
                     * cos(radians(c.longitude) - radians(:longitude))
                     + sin(radians(:latitude)) * sin(radians(c.latitude)))),
                 c.created_at DESC
        """,
        countQuery = "SELECT COUNT(*) FROM clubs c WHERE c.name ILIKE :pattern OR c.location ILIKE :pattern",
        nativeQuery = true)
    Page<Club> findNearest(@Param("pattern") String pattern, @Param("latitude") double latitude,
                           @Param("longitude") double longitude, Pageable pageable);
}
