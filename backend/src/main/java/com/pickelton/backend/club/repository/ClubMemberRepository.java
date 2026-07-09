package com.pickelton.backend.club.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.club.entity.ClubMember;
import com.pickelton.backend.enums.ClubRole;

public interface ClubMemberRepository extends JpaRepository<ClubMember, UUID> {

    boolean existsByClubIdAndUserId(UUID clubId, UUID userId);

    long countByClubId(UUID clubId);

    List<ClubMember> findByClubId(UUID clubId);

    List<ClubMember> findByUserId(UUID userId);

    @Query("""
        SELECT cm.club.name FROM ClubMember cm
        WHERE cm.user.id = :userId
        ORDER BY cm.club.name ASC
        """)
    List<String> findClubNamesByUserId(@Param("userId") UUID userId);

    Optional<ClubMember> findByClubIdAndUserId(UUID clubId, UUID userId);

    boolean existsByClubIdAndUserIdAndRole(UUID clubId, UUID userId, ClubRole role);

    boolean existsByClubIdAndUserIdAndRoleIn(UUID clubId, UUID userId, List<ClubRole> roles);

    long countByClubIdAndRole(UUID clubId, ClubRole role);
}
