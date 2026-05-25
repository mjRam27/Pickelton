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
import org.springframework.core.env.Environment;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String OTP_PREFIX = "auth:otp:phone:";
    private static final String ATTEMPTS_PREFIX = "auth:otp:attempts:";
    private static final String COOLDOWN_PREFIX = "auth:otp:cooldown:";

    private final StringRedisTemplate redisTemplate;
    private final Environment environment;

    @Value("${otp.expiration-minutes:10}")
    private long expirationMinutes;

    @Value("${otp.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Value("${otp.max-attempts:5}")
    private int maxAttempts;

    public void issuePhone(UUID userId, String phoneNumber) {
        try {
            Boolean accepted = redisTemplate.opsForValue().setIfAbsent(
                COOLDOWN_PREFIX + userId, "1", Duration.ofSeconds(resendCooldownSeconds));
            if (!Boolean.TRUE.equals(accepted)) {
                throw new BadRequestException("Wait before requesting another verification code");
            }
            String code = String.format("%06d", RANDOM.nextInt(1_000_000));
            redisTemplate.opsForValue().set(
                OTP_PREFIX + userId, hash(userId, code), Duration.ofMinutes(expirationMinutes));
            redisTemplate.delete(ATTEMPTS_PREFIX + userId);

            if (java.util.Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
                log.info("Development phone verification code phoneNumber={} code={}", phoneNumber, code);
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Failed to create phone OTP in Redis: {}", ex.getMessage());
            throw new ServiceUnavailableException("Phone verification service unavailable");
        }
    }

    public void verifyPhone(UUID userId, String submittedCode) {
        try {
            String expectedHash = redisTemplate.opsForValue().get(OTP_PREFIX + userId);
            if (expectedHash == null) {
                throw new BadRequestException("Verification code expired or not requested");
            }
            if (!MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.UTF_8),
                hash(userId, submittedCode).getBytes(StandardCharsets.UTF_8))) {
                Long attempts = redisTemplate.opsForValue().increment(ATTEMPTS_PREFIX + userId);
                redisTemplate.expire(ATTEMPTS_PREFIX + userId, Duration.ofMinutes(expirationMinutes));
                if (attempts != null && attempts >= maxAttempts) {
                    redisTemplate.delete(OTP_PREFIX + userId);
                    throw new BadRequestException("Too many invalid verification attempts. Request a new code");
                }
                throw new BadRequestException("Invalid verification code");
            }
            redisTemplate.delete(java.util.List.of(
                OTP_PREFIX + userId, ATTEMPTS_PREFIX + userId, COOLDOWN_PREFIX + userId));
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Failed to verify phone OTP in Redis: {}", ex.getMessage());
            throw new ServiceUnavailableException("Phone verification service unavailable");
        }
    }

    private String hash(UUID userId, String code) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest((userId + ":" + code).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash verification code", ex);
        }
    }
}
