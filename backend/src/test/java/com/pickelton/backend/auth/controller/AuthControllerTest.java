package com.pickelton.backend.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.auth.dto.AuthResponse;
import com.pickelton.backend.auth.dto.LoginRequest;
import com.pickelton.backend.auth.dto.RefreshTokenRequest;
import com.pickelton.backend.auth.dto.RegisterRequest;
import com.pickelton.backend.auth.service.AuthService;
import com.pickelton.backend.enums.PlatformRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.pickelton.backend.config.RateLimitInterceptor;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;

@WebMvcTest(value = AuthController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "jwt.expiration-ms=3600000",
    "allowed.origins=http://localhost:3000"
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private RateLimitInterceptor rateLimitInterceptor;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private JwtBlacklistService jwtBlacklistService;

    @BeforeEach
    void allowRequestsThroughRateLimit() throws Exception {
        when(rateLimitInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    }

    @Test
    void registerShouldReturnToken() throws Exception {
        when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse());

        RegisterRequest request = new RegisterRequest(
            "Alex",
            "alex@example.com",
            "+919876543210",
            LocalDate.of(1998, 1, 1),
            "password123"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.token").value("token"));
    }

    @Test
    void loginShouldReturnToken() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse());

        LoginRequest request = new LoginRequest("alex@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.token").value("token"));
    }

    @Test
    void refreshShouldRotateSessionAndReturnTokens() throws Exception {
        when(authService.refresh(any(RefreshTokenRequest.class))).thenReturn(sampleAuthResponse());

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RefreshTokenRequest("old-refresh"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.token").value("token"))
            .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"));
    }

    private AuthResponse sampleAuthResponse() {
        return new AuthResponse(
            "token",
            "refresh-token",
            900000,
            2592000000L,
            UUID.randomUUID(),
            "Alex",
            "alex@example.com",
            "+919876543210",
            LocalDate.of(1998, 1, 1),
            false,
            false,
            PlatformRole.USER
        );
    }
}
