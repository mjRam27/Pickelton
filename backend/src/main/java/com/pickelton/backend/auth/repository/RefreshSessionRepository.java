package com.pickelton.backend.auth.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.auth.entity.RefreshSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, UUID> {

    // Locked so two refreshes with the same token can't both rotate it.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM RefreshSession s WHERE s.tokenHash = :hash")
    Optional<RefreshSession> findByTokenHashForUpdate(@Param("hash") String hash);

    Optional<RefreshSession> findFirstByPreviousTokenHash(String previousTokenHash);

    List<RefreshSession> findByUserIdAndRevokedAtIsNull(UUID userId);

    @Modifying
    @Query("DELETE FROM RefreshSession s WHERE s.userId = :userId AND s.expiresAt < :now")
    void deleteExpired(@Param("userId") UUID userId, @Param("now") OffsetDateTime now);
}
