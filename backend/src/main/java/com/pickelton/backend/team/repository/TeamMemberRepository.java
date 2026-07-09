package com.pickelton.backend.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.team.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);

    List<TeamMember> findByTeamId(UUID teamId);

    List<TeamMember> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<TeamMember> findByTeamIdAndUserId(UUID teamId, UUID userId);
}
