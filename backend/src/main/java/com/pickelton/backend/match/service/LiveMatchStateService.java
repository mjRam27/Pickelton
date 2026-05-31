package com.pickelton.backend.match.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.match.dto.LiveMatchStateResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveMatchStateService {

    private static final String KEY_PREFIX = "match:";
    private static final String SCORE_CHANNEL = "match.score-updates";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${match.cache-ttl-minutes:120}")
    private long cacheTtlMinutes;

    public Optional<LiveMatchStateResponse> get(UUID matchId) {
        try {
            String value = redisTemplate.opsForValue().get(key(matchId));
            return value == null ? Optional.empty()
                : Optional.of(objectMapper.readValue(value, LiveMatchStateResponse.class));
        } catch (RuntimeException ex) {
            log.warn("Redis live-state read failed for match {}: {}", matchId, ex.getMessage());
            return Optional.empty();
        } catch (JsonProcessingException ex) {
            log.warn("Redis live-state JSON was invalid for match {}: {}", matchId, ex.getMessage());
            return Optional.empty();
        }
    }

    public void cache(LiveMatchStateResponse state) {
        try {
            redisTemplate.opsForValue().set(key(state.matchId()), objectMapper.writeValueAsString(state),
                Duration.ofMinutes(cacheTtlMinutes));
        } catch (RuntimeException | JsonProcessingException ex) {
            log.warn("Redis live-state cache failed for match {}: {}", state.matchId(), ex.getMessage());
        }
    }

    public void cacheAndPublish(LiveMatchStateResponse state) {
        cache(state);
        try {
            redisTemplate.convertAndSend(SCORE_CHANNEL, objectMapper.writeValueAsString(state));
        } catch (RuntimeException | JsonProcessingException ex) {
            log.warn("Redis score publish failed for match {}: {}", state.matchId(), ex.getMessage());
        }
    }

    public LiveMatchStateResponse snapshot(UUID matchId, com.pickelton.backend.enums.MatchStatus status,
                                           java.util.Map<String, Integer> scores,
                                           java.util.List<java.util.Map<String, Integer>> sets,
                                           long revision, OffsetDateTime updatedAt) {
        return new LiveMatchStateResponse(matchId, status, scores, sets, revision, updatedAt);
    }

    private String key(UUID matchId) {
        return KEY_PREFIX + matchId;
    }
}
