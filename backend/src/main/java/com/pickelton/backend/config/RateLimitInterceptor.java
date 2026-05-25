package com.pickelton.backend.config;

import java.io.IOException;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.common.exception.ServiceUnavailableException;
import com.pickelton.backend.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final long AUTH_LIMIT = 20;
    private static final long OTP_LIMIT = 8;
    private static final long DEFAULT_LIMIT = 100;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws IOException {
        String key = "rate-limit:" + scope(request) + ":" + clientIp(request);
        long count;
        try {
            Long incremented = redisTemplate.opsForValue().increment(key);
            count = incremented == null ? 1 : incremented;
            if (count == 1) {
                redisTemplate.expire(key, WINDOW);
            }
        } catch (Exception ex) {
            log.warn("Redis rate-limit check failed: {}", ex.getMessage());
            throw new ServiceUnavailableException("Request protection service unavailable");
        }
        if (count <= limitFor(request)) {
            return true;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiResponse.error("Too many requests"));
        return false;
    }

    private long limitFor(HttpServletRequest request) {
        return switch (scope(request)) {
            case "otp" -> OTP_LIMIT;
            case "auth" -> AUTH_LIMIT;
            default -> DEFAULT_LIMIT;
        };
    }

    private String scope(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/verification-code") || path.startsWith("/api/v1/auth/verify-code")) {
            return "otp";
        }
        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")
            || path.startsWith("/api/v1/auth/google") || path.startsWith("/api/v1/auth/refresh")) {
            return "auth";
        }
        return "default";
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}
