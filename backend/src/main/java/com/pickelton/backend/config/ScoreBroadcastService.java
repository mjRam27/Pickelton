package com.pickelton.backend.config;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.MatchStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScoreBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastScoreUpdate(UUID matchId, ScoreUpdatePayload payload) {
        messagingTemplate.convertAndSend("/topic/match/" + matchId, payload);
    }

    public record ScoreUpdatePayload(
        UUID matchId,
        int score1,
        int score2,
        MatchStatus status,
        OffsetDateTime updatedAt
    ) {
    }
}
