package com.pickelton.backend.match.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.match.entity.Match;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    List<Match> findByTournamentId(UUID tournamentId);

    List<Match> findByTournamentIdOrderByCreatedAtAsc(UUID tournamentId);

    @Query("""
        SELECT DISTINCT m FROM Match m
        LEFT JOIN FETCH m.teams t
        LEFT JOIN FETCH t.players tp
        LEFT JOIN FETCH tp.user
        WHERE m.id = :id
        """)
    Optional<Match> findByIdWithTeams(@Param("id") UUID id);

    @Query("""
        SELECT DISTINCT m FROM Match m
        LEFT JOIN FETCH m.teams t
        LEFT JOIN FETCH t.players tp
        LEFT JOIN FETCH tp.user
        WHERE m.tournament.id = :tournamentId
        ORDER BY m.createdAt ASC
        """)
    List<Match> findByTournamentIdOrderByCreatedAtAscWithTeams(@Param("tournamentId") UUID tournamentId);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE m.status = :status
          AND m.winner IS NOT NULL
          AND m.winner.id = :userId
        """)
    long countWinsByUserId(@Param("userId") UUID userId, @Param("status") MatchStatus status);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE m.status = :status
          AND m.winner IS NOT NULL
          AND m.winner.id <> :userId
          AND (m.player1.id = :userId OR m.player2.id = :userId)
        """)
    long countLossesByUserId(@Param("userId") UUID userId, @Param("status") MatchStatus status);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE m.player1.id = :userId OR m.player2.id = :userId
        """)
    long countTotalMatchesByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE m.status = :status
          AND (m.player1.id = :userId OR m.player2.id = :userId)
        """)
    long countTotalMatchesByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") MatchStatus status);
}
