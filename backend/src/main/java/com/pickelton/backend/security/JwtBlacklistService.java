package com.pickelton.backend.security;

import java.time.Duration;
import java.util.Date;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

import com.pickelton.backend.common.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtBlacklistService {

    private static final String PREFIX = "auth:blacklist:";

    private final StringRedisTemplate redisTemplate;

    public void blacklist(String token, Date expiration) {
        long ttlMs = expiration == null ? 0 : expiration.getTime() - System.currentTimeMillis();
        if (ttlMs <= 0) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(key(token), "true", Duration.ofMillis(ttlMs));
        } catch (Exception ex) {
            log.warn("Failed to blacklist token in Redis: {}", ex.getMessage());
            throw new ServiceUnavailableException("Authentication session service unavailable");
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            Boolean exists = redisTemplate.hasKey(key(token));
            return Boolean.TRUE.equals(exists);
        } catch (Exception ex) {
            log.warn("Redis blacklist check failed, denying token: {}", ex.getMessage());
            return true;
        }
    }

    private String key(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));
            return PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash access token", ex);
        }
    }
}
