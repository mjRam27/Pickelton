package com.pickelton.backend.club.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.service.ClubService;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.config.RateLimitInterceptor;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
import com.pickelton.backend.storage.service.StorageService;
import com.pickelton.backend.user.dto.PublicUserSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(value = ClubController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "jwt.expiration-ms=3600000",
    "allowed.origins=http://localhost:3000"
})
class ClubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClubService clubService;

    @MockBean
    private StorageService storageService;

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
    void getClubsShouldReturnPaginatedResponse() throws Exception {
        when(clubService.getClubs(any(), anyInt(), anyInt())).thenReturn(samplePageResponse());

        mockMvc.perform(get("/api/clubs").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].name").value("Pickelton Club"));
    }

    private PageResponse<ClubResponse> samplePageResponse() {
        OffsetDateTime now = OffsetDateTime.now();
        return new PageResponse<>(
            List.of(new ClubResponse(
                UUID.randomUUID(),
                "Pickelton Club",
                "Community club",
                "Bangalore",
                "Bangalore",
                "https://example.com/logo.jpg",
                new PublicUserSummary(
                    UUID.randomUUID(),
                    "Admin",
                    null,
                    "Bangalore"
                ),
                12L,
                now,
                now
            )),
            0,
            20,
            1,
            1,
            true
        );
    }
}
