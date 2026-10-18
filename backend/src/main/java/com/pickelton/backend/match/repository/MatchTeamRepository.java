package com.pickelton.backend.match.repository;

import com.pickelton.backend.match.entity.MatchTeam;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchTeamRepository extends JpaRepository<MatchTeam, UUID> {

    List<MatchTeam> findByMatchIdOrderByTeamNoAsc(UUID matchId);
}
