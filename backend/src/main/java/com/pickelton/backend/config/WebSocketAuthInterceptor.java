package com.pickelton.backend.config;

import java.util.UUID;

import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final String USER_ID_ATTR = "userId";
    private static final String EMAIL_ATTR = "email";

    private final JwtUtil jwtUtil;
    private final JwtBlacklistService blacklistService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new MessageDeliveryException("Unauthorized");
        }
        String token = authorization.substring(7);
        if (!jwtUtil.validateToken(token) || blacklistService.isBlacklisted(token)) {
            throw new MessageDeliveryException("Unauthorized");
        }
        try {
            UUID userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);
            if (accessor.getSessionAttributes() != null) {
                accessor.getSessionAttributes().put(USER_ID_ATTR, userId);
                accessor.getSessionAttributes().put(EMAIL_ATTR, email);
            }
        } catch (Exception ex) {
            throw new MessageDeliveryException("Unauthorized");
        }
        return message;
    }
}
