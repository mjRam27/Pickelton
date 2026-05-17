package com.pickelton.backend.config;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.common.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Bandwidth AUTH_LIMIT = Bandwidth.builder()
        .capacity(20)
        .refillIntervally(20, Duration.ofMinutes(1))
        .build();

    private static final Bandwidth DEFAULT_LIMIT = Bandwidth.builder()
        .capacity(100)
        .refillIntervally(100, Duration.ofMinutes(1))
        .build();

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws IOException {
        String key = bucketKey(request);
        Bucket bucket = buckets.computeIfAbsent(key, k -> Bucket.builder().addLimit(limitFor(request)).build());

        if (bucket.tryConsume(1)) {
            return true;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiResponse.error("Too many requests"));
        return false;
    }

    private Bandwidth limitFor(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
            return AUTH_LIMIT;
        }
        return DEFAULT_LIMIT;
    }

    private String bucketKey(HttpServletRequest request) {
        String ip = clientIp(request);
        String path = request.getRequestURI();
        String scope = (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register"))
            ? "auth" : "default";
        return scope + ":" + ip;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}
