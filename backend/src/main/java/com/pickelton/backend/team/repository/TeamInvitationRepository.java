package com.pickelton.backend.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.team.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {

    boolean existsByTeamIdAndInvitedUserIdAndStatus(UUID teamId, UUID invitedUserId, InvitationStatus status);

    List<TeamInvitation> findByInvitedUserIdOrderByCreatedAtDesc(UUID invitedUserId);

    Optional<TeamInvitation> findByIdAndInvitedUserId(UUID id, UUID invitedUserId);
}
