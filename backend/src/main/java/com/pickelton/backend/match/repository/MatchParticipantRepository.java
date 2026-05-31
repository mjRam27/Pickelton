package com.pickelton.backend.match.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchParticipantStatus;
import com.pickelton.backend.match.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, UUID> {

    List<MatchParticipant> findByMatchIdOrderByCreatedAtAsc(UUID matchId);

    boolean existsByMatchIdAndUserIdAndRoleInAndStatus(UUID matchId, UUID userId,
                                                       List<MatchParticipantRole> roles,
                                                       MatchParticipantStatus status);
}
