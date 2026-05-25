package com.pickelton.backend.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String PREFIX = "auth:refresh:";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.refresh-expiration-ms:2592000000}")
    private long refreshExpirationMs;

    public IssuedRefreshToken issue(UUID userId) {
        byte[] random = new byte[48];
        RANDOM.nextBytes(random);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        try {
            redisTemplate.opsForValue().set(key(token), userId.toString(), Duration.ofMillis(refreshExpirationMs));
        } catch (Exception ex) {
            log.warn("Failed to create refresh session in Redis: {}", ex.getMessage());
            throw new ServiceUnavailableException("Authentication session service unavailable");
        }
        return new IssuedRefreshToken(token, refreshExpirationMs);
    }

    public UUID consumeForRotation(String token) {
        String userId;
        try {
            userId = redisTemplate.opsForValue().getAndDelete(key(token));
        } catch (Exception ex) {
            log.warn("Failed to rotate refresh session in Redis: {}", ex.getMessage());
            throw new ServiceUnavailableException("Authentication session service unavailable");
        }
        if (userId == null) {
            throw new BadRequestException("Refresh token is invalid or expired");
        }
        return UUID.fromString(userId);
    }

    public void revoke(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            redisTemplate.delete(key(token));
        } catch (Exception ex) {
            log.warn("Failed to revoke refresh session in Redis: {}", ex.getMessage());
            throw new ServiceUnavailableException("Authentication session service unavailable");
        }
    }

    private String key(String token) {
        return PREFIX + sha256(token);
    }

    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }

    public record IssuedRefreshToken(String token, long expiresInMs) {
    }
}
