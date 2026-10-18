package com.pickelton.backend.club.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pickelton.backend.club.entity.ClubMember;
import com.pickelton.backend.enums.ClubRole;

public interface ClubMemberRepository extends JpaRepository<ClubMember, UUID> {

    boolean existsByClubIdAndUserId(UUID clubId, UUID userId);

    long countByClubId(UUID clubId);

    List<ClubMember> findByClubId(UUID clubId);

    List<ClubMember> findByUserId(UUID userId);

    Optional<ClubMember> findByClubIdAndUserId(UUID clubId, UUID userId);

    boolean existsByClubIdAndUserIdAndRole(UUID clubId, UUID userId, ClubRole role);

    long countByClubIdAndRole(UUID clubId, ClubRole role);
}
