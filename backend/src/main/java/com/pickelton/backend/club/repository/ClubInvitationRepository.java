package com.pickelton.backend.club.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.club.entity.ClubInvitation;
import com.pickelton.backend.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubInvitationRepository extends JpaRepository<ClubInvitation, UUID> {

    boolean existsByClubIdAndInvitedUserIdAndStatus(UUID clubId, UUID invitedUserId, InvitationStatus status);

    List<ClubInvitation> findByInvitedUserIdOrderByCreatedAtDesc(UUID invitedUserId);

    Optional<ClubInvitation> findByIdAndInvitedUserId(UUID id, UUID invitedUserId);
}
