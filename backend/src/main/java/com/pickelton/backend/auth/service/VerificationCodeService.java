package com.pickelton.backend.auth.service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.pickelton.backend.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class VerificationCodeService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TTL_MINUTES = 10;
    private static final String PHONE_CHANNEL = "PHONE";

    private final Map<String, VerificationCode> codes = new ConcurrentHashMap<>();

    public void issuePhone(UUID userId, String phoneNumber) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        codes.put(key(userId), new VerificationCode(code, OffsetDateTime.now().plusMinutes(TTL_MINUTES)));

        // Replace this with a real SMS provider. Kept explicit for local Swagger testing.
        log.info("Phone verification code issued phoneNumber={} code={}", phoneNumber, code);
    }

    public void verifyPhone(UUID userId, String submittedCode) {
        VerificationCode stored = codes.get(key(userId));
        if (stored == null || stored.expiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Verification code expired or not requested");
        }
        if (!stored.code().equals(submittedCode)) {
            throw new BadRequestException("Invalid verification code");
        }
        codes.remove(key(userId));
    }

    private String key(UUID userId) {
        return userId + ":" + PHONE_CHANNEL;
    }

    private record VerificationCode(String code, OffsetDateTime expiresAt) {
    }
}
