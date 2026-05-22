package com.pickelton.backend.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.auth.dto.AuthResponse;
import com.pickelton.backend.auth.dto.GoogleLoginRequest;
import com.pickelton.backend.auth.dto.LoginRequest;
import com.pickelton.backend.auth.dto.MeResponse;
import com.pickelton.backend.auth.dto.RegisterRequest;
import com.pickelton.backend.auth.dto.VerifyCodeRequest;
import com.pickelton.backend.auth.service.AuthService;
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
    void googleLoginShouldReturnToken() throws Exception {
        when(authService.googleLogin(any(GoogleLoginRequest.class))).thenReturn(sampleAuthResponse());

        GoogleLoginRequest request = new GoogleLoginRequest(
            "google-id-token",
            "+919876543210",
            LocalDate.of(1998, 1, 1)
        );

        mockMvc.perform(post("/api/v1/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.token").value("token"));
    }

    @Test
    void logoutWithBearerTokenShouldCallService() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                .header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Logged out"));

        verify(authService).logout("token");
    }

    @Test
    void logoutWithoutBearerTokenShouldNotCallService() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Logged out"));

        verify(authService, never()).logout(any());
    }

    @Test
    void requestPhoneVerificationCodeShouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/v1/auth/verification-code"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Phone verification code sent"));

        verify(authService).requestPhoneVerificationCode();
    }

    @Test
    void verifyCodeShouldReturnOk() throws Exception {
        VerifyCodeRequest request = new VerifyCodeRequest("123456");

        mockMvc.perform(post("/api/v1/auth/verify-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Phone verification completed"));

        verify(authService).verifyPhoneCode(any(VerifyCodeRequest.class));
    }

    @Test
    void meShouldReturnCurrentUserProfile() throws Exception {
        when(authService.me()).thenReturn(sampleMeResponse());

        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.email").value("alex@example.com"))
            .andExpect(jsonPath("$.data.phoneVerified").value(false));
    }

    @Test
    void verifyCodeShouldReturnBadRequestWhenCodeIsBlank() throws Exception {
        VerifyCodeRequest request = new VerifyCodeRequest("");

        mockMvc.perform(post("/api/v1/auth/verify-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());

        verify(authService, never()).verifyPhoneCode(any(VerifyCodeRequest.class));
    }

    private AuthResponse sampleAuthResponse() {
        return new AuthResponse(
            "token",
            UUID.randomUUID(),
            "Alex",
            "alex@example.com",
            "+919876543210",
            LocalDate.of(1998, 1, 1),
            false,
            false
        );
    }

    private MeResponse sampleMeResponse() {
        return new MeResponse(
            UUID.randomUUID(),
            "Alex",
            "alex@example.com",
            "+919876543210",
            LocalDate.of(1998, 1, 1),
            false,
            false,
            OffsetDateTime.now()
        );
    }
}
