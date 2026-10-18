package com.pickelton.backend.config;

import java.util.UUID;

import com.pickelton.backend.match.dto.LiveScoreResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScoreBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastScoreUpdate(UUID matchId, LiveScoreResponse payload) {
        messagingTemplate.convertAndSend("/topic/match/" + matchId, payload);
    }
}
