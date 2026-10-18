package com.pickelton.backend.match.repository;

import com.pickelton.backend.match.entity.MatchTeamPlayer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchTeamPlayerRepository extends JpaRepository<MatchTeamPlayer, UUID> {

    List<MatchTeamPlayer> findByTeamIdOrderBySlotNoAsc(UUID teamId);
}
