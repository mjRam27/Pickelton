package com.pickelton.backend.config;

import java.util.UUID;

import com.pickelton.backend.match.dto.LiveMatchStateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScoreBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastScoreUpdate(UUID matchId, LiveMatchStateResponse payload) {
        messagingTemplate.convertAndSend("/topic/match/" + matchId, payload);
    }
}
