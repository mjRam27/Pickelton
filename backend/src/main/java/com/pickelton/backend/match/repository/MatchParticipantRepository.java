package com.pickelton.backend.match.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.match.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, UUID> {

    List<MatchParticipant> findByMatchIdOrderByCreatedAtAsc(UUID matchId);

    List<MatchParticipant> findByMatchIdAndRole(UUID matchId, ParticipantRole role);

    boolean existsByMatchIdAndUserIdAndRoleInAndInvitationStatus(UUID matchId, UUID userId,
                                                                 Collection<ParticipantRole> roles,
                                                                 InvitationStatus invitationStatus);
}
