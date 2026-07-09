package com.pickelton.backend.club.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.enums.ClubStatus;

public interface ClubRepository extends JpaRepository<Club, UUID> {
    Page<Club> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location, Pageable pageable);

    long countByOwnerIdAndStatus(UUID ownerId, ClubStatus status);
}
