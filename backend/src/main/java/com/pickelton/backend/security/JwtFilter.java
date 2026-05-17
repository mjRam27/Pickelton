package com.pickelton.backend.security;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final String TRACE_ID = "traceId";

    private final JwtUtil jwtUtil;
    private final JwtBlacklistService blacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        if (MDC.get(TRACE_ID) == null) {
            MDC.put(TRACE_ID, UUID.randomUUID().toString());
        }
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                authenticate(token, request);
            }
            chain.doFilter(request, response);
        } finally {
            MDC.remove(TRACE_ID);
        }
    }

    private void authenticate(String token, HttpServletRequest request) {
        try {
            if (!jwtUtil.validateToken(token)) {
                return;
            }
            if (blacklistService.isBlacklisted(token)) {
                return;
            }
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                return;
            }
            UUID userId = jwtUtil.extractUserId(token);
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userId.toString(), null, Collections.emptyList());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
            log.debug("JWT authentication failed: {}", ex.getMessage());
        }
    }
}
