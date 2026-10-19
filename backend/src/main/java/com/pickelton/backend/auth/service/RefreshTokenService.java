package com.pickelton.backend.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.auth.entity.RefreshSession;
import com.pickelton.backend.auth.repository.RefreshSessionRepository;
import com.pickelton.backend.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Sign-in sessions. The access token (JWT) is short-lived and stateless; the refresh token is an opaque random
// string tied to a session row in Postgres. Each refresh rotates the token and extends the session, so a user
// who opens the app at least once per refresh period stays signed in.
@Slf4j
@Service
@RequiredArgsConstructor
// A revoked session must stay revoked even though we then answer 401.
@Transactional(noRollbackFor = UnauthorizedException.class)
public class RefreshTokenService {

    // A token that was just replaced still works this long, so two tabs (or a retried request) refreshing at the
    // same moment don't sign the user out. Reusing it later looks like theft and ends the session.
    private static final long GRACE_SECONDS = 60;
    private static final String LEGACY_REDIS_PREFIX = "auth:refresh:";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshSessionRepository sessionRepository;
    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.refresh-expiration-ms:2592000000}")
    private long refreshExpirationMs;

    public IssuedRefreshToken issue(UUID userId) {
        OffsetDateTime now = OffsetDateTime.now();
        sessionRepository.deleteExpired(userId, now);
        String token = newToken();
        sessionRepository.save(RefreshSession.builder()
            .userId(userId)
            .tokenHash(hash(token))
            .lastUsedAt(now)
            .expiresAt(now.plusNanos(refreshExpirationMs * 1_000_000))
            .build());
        return new IssuedRefreshToken(userId, token, refreshExpirationMs);
    }

    // Swaps a refresh token for a new one. Throws 401 when the session is gone, so clients sign the user out.
    public IssuedRefreshToken rotate(String token) {
        String hash = hash(token);
        OffsetDateTime now = OffsetDateTime.now();
        Optional<RefreshSession> current = sessionRepository.findByTokenHashForUpdate(hash);
        if (current.isPresent()) {
            RefreshSession session = current.get();
            if (session.getRevokedAt() != null || session.getExpiresAt().isBefore(now)) {
                throw expired();
            }
            String next = newToken();
            session.setPreviousTokenHash(hash);
            session.setTokenHash(hash(next));
            session.setRotatedAt(now);
            session.setLastUsedAt(now);
            session.setExpiresAt(now.plusNanos(refreshExpirationMs * 1_000_000));
            sessionRepository.save(session);
            return new IssuedRefreshToken(session.getUserId(), next, refreshExpirationMs);
        }

        Optional<RefreshSession> replaced = sessionRepository.findFirstByPreviousTokenHash(hash);
        if (replaced.isPresent()) {
            RefreshSession session = replaced.get();
            boolean withinGrace = session.getRotatedAt() != null && session.getRotatedAt().plusSeconds(GRACE_SECONDS).isAfter(now);
            if (session.getRevokedAt() == null && withinGrace) {
                // Another tab already rotated this token a moment ago; give this one its own session.
                return issue(session.getUserId());
            }
            session.setRevokedAt(now);
            sessionRepository.save(session);
            log.warn("Old refresh token reused after rotation; session {} revoked", session.getId());
            throw expired();
        }

        // Sessions created before they moved to Postgres were kept in Redis; carry them over once.
        UUID legacyUser = takeLegacySession(hash);
        if (legacyUser != null) {
            return issue(legacyUser);
        }
        throw expired();
    }

    public void revoke(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        sessionRepository.findByTokenHashForUpdate(hash(token)).ifPresent(session -> {
            session.setRevokedAt(OffsetDateTime.now());
            sessionRepository.save(session);
        });
    }

    // "Sign out everywhere": ends every session of the user.
    public void revokeAll(UUID userId) {
        OffsetDateTime now = OffsetDateTime.now();
        sessionRepository.findByUserIdAndRevokedAtIsNull(userId).forEach(session -> session.setRevokedAt(now));
    }

    private UUID takeLegacySession(String hash) {
        try {
            // GET + DEL rather than GETDEL, which older Redis versions (e.g. 3.x on Windows) don't have.
            String key = LEGACY_REDIS_PREFIX + hash;
            String userId = redisTemplate.opsForValue().get(key);
            if (userId == null) {
                return null;
            }
            redisTemplate.delete(key);
            return UUID.fromString(userId);
        } catch (Exception ex) {
            log.debug("Legacy refresh lookup skipped: {}", ex.getMessage());
            return null;
        }
    }

    private static UnauthorizedException expired() {
        return new UnauthorizedException("Your session has ended. Please sign in again.");
    }

    private static String newToken() {
        byte[] random = new byte[48];
        RANDOM.nextBytes(random);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(random);
    }

    // Same hash format as the old Redis keys, so legacy sessions can be found.
    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }

    public record IssuedRefreshToken(UUID userId, String token, long expiresInMs) {
    }
}
