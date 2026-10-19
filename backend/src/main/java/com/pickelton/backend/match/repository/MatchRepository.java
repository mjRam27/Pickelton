package com.pickelton.backend.match.repository;

import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Role is passed as a parameter: an enum literal in JPQL is cast to a Postgres type named after the Java class
// (ParticipantRole), which doesn't exist; the column type is participant_role.
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
                AND p.role = :role
          )
        """)
    long countLossesByUserId(@Param("userId") UUID userId, @Param("status") MatchStatus status, @Param("role") ParticipantRole role);

    default long countLossesByUserId(UUID userId, MatchStatus status) {
        return countLossesByUserId(userId, status, ParticipantRole.PLAYER);
    }

    @Query("""
        SELECT COUNT(m) FROM Match m
        WHERE EXISTS (
            SELECT p FROM MatchParticipant p
            WHERE p.match = m
              AND p.user.id = :userId
              AND p.role = :role
        )
        """)
    long countTotalMatchesByUserId(@Param("userId") UUID userId, @Param("role") ParticipantRole role);

    default long countTotalMatchesByUserId(UUID userId) {
        return countTotalMatchesByUserId(userId, ParticipantRole.PLAYER);
    }

    @Query("""
        SELECT COUNT(DISTINCT m) FROM Match m
        JOIN MatchParticipant p ON p.match = m
        WHERE m.status = :status
          AND EXISTS (
              SELECT p FROM MatchParticipant p
              WHERE p.match = m
                AND p.user.id = :userId
                AND p.role = :role
          )
        """)
    long countTotalMatchesByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") MatchStatus status, @Param("role") ParticipantRole role);

    default long countTotalMatchesByUserIdAndStatus(UUID userId, MatchStatus status) {
        return countTotalMatchesByUserIdAndStatus(userId, status, ParticipantRole.PLAYER);
    }
}
