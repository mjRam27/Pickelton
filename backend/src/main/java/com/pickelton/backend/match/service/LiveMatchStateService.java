package com.pickelton.backend.match.service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.match.dto.LiveScoreResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveMatchStateService {

    private static final String MATCH_KEY_PREFIX = "match:";
    private static final String SCORE_CHANNEL = "match.score-updates";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${match.cache-ttl-minutes:120}")
    private long cacheTtlMinutes;

    public Optional<LiveScoreResponse> get(UUID matchId) {
        String raw = stringRedisTemplate.opsForValue().get(key(matchId));
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(raw, LiveScoreResponse.class));
        } catch (JsonProcessingException ex) {
            log.warn("Invalid live match state in Redis for match {}", matchId, ex);
            return Optional.empty();
        }
    }

    public void cache(LiveScoreResponse response) {
        try {
            stringRedisTemplate.opsForValue().set(key(response.matchId()),
                objectMapper.writeValueAsString(response), Duration.ofMinutes(cacheTtlMinutes));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Could not serialize live match state", ex);
        }
    }

    public void cacheAndPublish(LiveScoreResponse response) {
        cache(response);
        try {
            stringRedisTemplate.convertAndSend(SCORE_CHANNEL, objectMapper.writeValueAsString(response));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Could not publish live match state", ex);
        }
    }

    private String key(UUID matchId) {
        return MATCH_KEY_PREFIX + matchId;
    }
}
