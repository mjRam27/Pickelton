package com.pickelton.backend.match.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.match.entity.Match;

public interface MatchRepository extends JpaRepository<Match, UUID> {

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
          AND EXISTS (
              SELECT p FROM MatchParticipant p
              WHERE p.match = m
                AND p.user.id = :userId
                AND p.role = com.pickelton.backend.enums.ParticipantRole.PLAYER
          )
        """)
    long countLossesByUserId(@Param("userId") UUID userId, @Param("status") MatchStatus status);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE EXISTS (
            SELECT p FROM MatchParticipant p
            WHERE p.match = m
              AND p.user.id = :userId
              AND p.role = com.pickelton.backend.enums.ParticipantRole.PLAYER
        )
        """)
    long countTotalMatchesByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE m.status = :status
          AND EXISTS (
              SELECT p FROM MatchParticipant p
              WHERE p.match = m
                AND p.user.id = :userId
                AND p.role = com.pickelton.backend.enums.ParticipantRole.PLAYER
          )
        """)
    long countTotalMatchesByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") MatchStatus status);
}
