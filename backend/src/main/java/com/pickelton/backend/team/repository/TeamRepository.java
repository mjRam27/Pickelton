package com.pickelton.backend.team.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, UUID> {

    List<Team> findByCaptainIdOrderByCreatedAtDesc(UUID captainId);
}
