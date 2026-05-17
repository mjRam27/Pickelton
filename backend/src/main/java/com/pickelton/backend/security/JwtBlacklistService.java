package com.pickelton.backend.security;

import java.time.Duration;
import java.util.Date;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtBlacklistService {

    private static final String PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;

    public void blacklist(String token, Date expiration) {
        long ttlMs = expiration == null ? 0 : expiration.getTime() - System.currentTimeMillis();
        if (ttlMs <= 0) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(PREFIX + token, "true", Duration.ofMillis(ttlMs));
        } catch (Exception ex) {
            log.warn("Failed to blacklist token in Redis: {}", ex.getMessage());
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            Boolean exists = redisTemplate.hasKey(PREFIX + token);
            return Boolean.TRUE.equals(exists);
        } catch (Exception ex) {
            log.warn("Redis blacklist check failed, denying token: {}", ex.getMessage());
            return false;
        }
    }
}
