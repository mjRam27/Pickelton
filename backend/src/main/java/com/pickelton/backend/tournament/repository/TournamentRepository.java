package com.pickelton.backend.tournament.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pickelton.backend.tournament.entity.Tournament;

public interface TournamentRepository extends JpaRepository<Tournament, UUID> {

    List<Tournament> findByClubId(UUID clubId);
}