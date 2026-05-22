package com.pickelton.backend.tournament.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.config.RateLimitInterceptor;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.enums.TournamentType;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
import com.pickelton.backend.tournament.dto.CreateTournamentRequest;
import com.pickelton.backend.tournament.dto.TournamentResponse;
import com.pickelton.backend.tournament.service.TournamentService;
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

@WebMvcTest(value = TournamentController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "jwt.expiration-ms=3600000",
    "allowed.origins=http://localhost:3000"
})
class TournamentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TournamentService tournamentService;

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
    void createTournamentShouldReturnTournament() throws Exception {
        when(tournamentService.createTournament(any(CreateTournamentRequest.class))).thenReturn(sampleTournamentResponse());

        CreateTournamentRequest request = new CreateTournamentRequest(
            "Spring Open",
            "Regional tournament",
            SportType.PICKLEBALL,
            TournamentType.SINGLES,
            UUID.randomUUID(),
            new BigDecimal("20.00"),
            32,
            LocalDateTime.of(2026, 7, 1, 10, 0)
        );

        mockMvc.perform(post("/api/tournaments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Tournament created"))
            .andExpect(jsonPath("$.data.name").value("Spring Open"))
            .andExpect(jsonPath("$.data.sportType").value("PICKLEBALL"))
            .andExpect(jsonPath("$.data.tournamentType").value("SINGLES"));

        verify(tournamentService).createTournament(any(CreateTournamentRequest.class));
    }

    @Test
    void createTournamentShouldReturnBadRequestWhenNameIsBlank() throws Exception {
        CreateTournamentRequest request = new CreateTournamentRequest(
            "",
            "Regional tournament",
            SportType.PICKLEBALL,
            TournamentType.SINGLES,
            UUID.randomUUID(),
            new BigDecimal("20.00"),
            32,
            LocalDateTime.of(2026, 7, 1, 10, 0)
        );

        mockMvc.perform(post("/api/tournaments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());

        verify(tournamentService, never()).createTournament(any(CreateTournamentRequest.class));
    }

    @Test
    void getTournamentsShouldReturnPaginatedResponse() throws Exception {
        when(tournamentService.getTournaments(anyInt(), anyInt())).thenReturn(samplePageResponse());

        mockMvc.perform(get("/api/tournaments").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Tournaments fetched"))
            .andExpect(jsonPath("$.data.content[0].name").value("Spring Open"))
            .andExpect(jsonPath("$.data.page").value(0))
            .andExpect(jsonPath("$.data.size").value(20));
    }

    @Test
    void getTournamentShouldReturnTournamentById() throws Exception {
        UUID tournamentId = UUID.randomUUID();
        when(tournamentService.getTournament(tournamentId)).thenReturn(sampleTournamentResponse());

        mockMvc.perform(get("/api/tournaments/{id}", tournamentId).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Tournament fetched"))
            .andExpect(jsonPath("$.data.name").value("Spring Open"))
            .andExpect(jsonPath("$.data.status").value("UPCOMING"));

        verify(tournamentService).getTournament(tournamentId);
    }

    private PageResponse<TournamentResponse> samplePageResponse() {
        return new PageResponse<>(
            List.of(sampleTournamentResponse()),
            0,
            20,
            1,
            1,
            true
        );
    }

    private TournamentResponse sampleTournamentResponse() {
        OffsetDateTime now = OffsetDateTime.now();
        UUID clubId = UUID.randomUUID();
        return new TournamentResponse(
            UUID.randomUUID(),
            "Spring Open",
            "Regional tournament",
            SportType.PICKLEBALL,
            TournamentType.SINGLES,
            TournamentStatus.UPCOMING,
            new UserResponse(
                UUID.randomUUID(),
                "Host User",
                "host@example.com",
                "+919876543210",
                LocalDate.of(1992, 5, 15),
                true,
                true,
                now,
                now
            ),
            clubId,
            "Pickelton Club",
            new BigDecimal("20.00"),
            32,
            LocalDateTime.of(2026, 7, 1, 10, 0),
            now,
            now
        );
    }
}
