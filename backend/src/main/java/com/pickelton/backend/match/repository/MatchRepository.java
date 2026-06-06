package com.pickelton.backend.match.repository;

import java.util.UUID;

import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    @Query("""
        SELECT COUNT(DISTINCT m) FROM Match m
        WHERE m.status = :status
          AND m.winner IS NOT NULL
          AND m.winner.id = :userId
        """)
    long countWinsByUserId(@Param("userId") UUID userId, @Param("status") MatchStatus status);

    @Query("""
        SELECT COUNT(DISTINCT m) FROM Match m
        JOIN MatchParticipant p ON p.match = m
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
    long countLossesByUserId(@Param("userId") UUID userId, @Param("status") MatchStatus status,
                             @Param("role") MatchParticipantRole role);

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE EXISTS (
            SELECT p FROM MatchParticipant p
            WHERE p.match = m
              AND p.user.id = :userId
              AND p.role = com.pickelton.backend.enums.ParticipantRole.PLAYER
        )
        """)
    long countTotalMatchesByUserId(@Param("userId") UUID userId, @Param("role") MatchParticipantRole role);

    @Query("""
        SELECT COUNT(DISTINCT m) FROM Match m
        JOIN MatchParticipant p ON p.match = m
        WHERE m.status = :status
          AND EXISTS (
              SELECT p FROM MatchParticipant p
              WHERE p.match = m
                AND p.user.id = :userId
                AND p.role = com.pickelton.backend.enums.ParticipantRole.PLAYER
          )
        """)
    long countTotalMatchesByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") MatchStatus status,
                                            @Param("role") MatchParticipantRole role);
}
