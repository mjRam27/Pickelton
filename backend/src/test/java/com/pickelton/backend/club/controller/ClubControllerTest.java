package com.pickelton.backend.club.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.club.dto.ClubMemberResponse;
import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.dto.CreateClubRequest;
import com.pickelton.backend.club.service.ClubService;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.config.RateLimitInterceptor;
import com.pickelton.backend.enums.ClubRole;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
import com.pickelton.backend.user.dto.UserResponse;
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

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClubService clubService;

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
        when(clubService.getClubs(anyInt(), anyInt())).thenReturn(samplePageResponse());

        mockMvc.perform(get("/api/clubs").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Clubs fetched"))
            .andExpect(jsonPath("$.data.content[0].name").value("Pickelton Club"))
            .andExpect(jsonPath("$.data.page").value(0))
            .andExpect(jsonPath("$.data.size").value(20));
    }

    @Test
    void createClubShouldReturnCreatedClub() throws Exception {
        when(clubService.createClub(any(CreateClubRequest.class))).thenReturn(sampleClubResponse());

        CreateClubRequest request = new CreateClubRequest(
            "Pickelton Club",
            "Community club",
            "Bangalore"
        );

        mockMvc.perform(post("/api/clubs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Club created"))
            .andExpect(jsonPath("$.data.name").value("Pickelton Club"))
            .andExpect(jsonPath("$.data.location").value("Bangalore"));

        verify(clubService).createClub(any(CreateClubRequest.class));
    }

    @Test
    void createClubShouldReturnBadRequestWhenNameIsBlank() throws Exception {
        CreateClubRequest request = new CreateClubRequest(
            "",
            "Community club",
            "Bangalore"
        );

        mockMvc.perform(post("/api/clubs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());

        verify(clubService, never()).createClub(any(CreateClubRequest.class));
    }

    @Test
    void getClubShouldReturnClubById() throws Exception {
        UUID clubId = UUID.randomUUID();
        when(clubService.getClub(clubId)).thenReturn(sampleClubResponse());

        mockMvc.perform(get("/api/clubs/{id}", clubId).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Club fetched"))
            .andExpect(jsonPath("$.data.name").value("Pickelton Club"));

        verify(clubService).getClub(clubId);
    }

    @Test
    void joinClubShouldReturnMembership() throws Exception {
        UUID clubId = UUID.randomUUID();
        UUID membershipId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(clubService.joinClub(clubId)).thenReturn(new ClubMemberResponse(
            membershipId,
            clubId,
            userId,
            ClubRole.MEMBER
        ));

        mockMvc.perform(post("/api/clubs/{id}/join", clubId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Joined club"))
            .andExpect(jsonPath("$.data.id").value(membershipId.toString()))
            .andExpect(jsonPath("$.data.clubId").value(clubId.toString()))
            .andExpect(jsonPath("$.data.userId").value(userId.toString()))
            .andExpect(jsonPath("$.data.role").value("MEMBER"));

        verify(clubService).joinClub(clubId);
    }

    private PageResponse<ClubResponse> samplePageResponse() {
        OffsetDateTime now = OffsetDateTime.now();
        return new PageResponse<>(
            List.of(sampleClubResponse()),
            0,
            20,
            1,
            1,
            true
        );
    }

    private ClubResponse sampleClubResponse() {
        OffsetDateTime now = OffsetDateTime.now();
        return new ClubResponse(
            UUID.randomUUID(),
            "Pickelton Club",
            "Community club",
            "Bangalore",
            new UserResponse(
                UUID.randomUUID(),
                "Admin",
                "admin@example.com",
                "+919876543210",
                LocalDate.of(1990, 1, 1),
                true,
                true,
                now,
                now
            ),
            12L,
            now,
            now
        );
    }
}
