package com.pickelton.backend.club.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pickelton.backend.club.entity.ClubMember;

public interface ClubMemberRepository extends JpaRepository<ClubMember, UUID> {

    boolean existsByClubIdAndUserId(UUID clubId, UUID userId);

    long countByClubId(UUID clubId);

    List<ClubMember> findByClubId(UUID clubId);
}