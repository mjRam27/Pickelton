package com.pickelton.backend.match.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.config.RateLimitInterceptor;
import com.pickelton.backend.enums.GameType;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.CreateMatchTeamRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.MatchTeamPlayerResponse;
import com.pickelton.backend.match.dto.MatchTeamResponse;
import com.pickelton.backend.match.service.MatchService;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(value = MatchController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class
    })
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = {
    "jwt.expiration-ms=3600000",
    "allowed.origins=http://localhost:3000"
})
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MatchService matchService;

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
    void createMatchShouldReturnCreatedMatch() throws Exception {
        when(matchService.createMatch(any(CreateMatchRequest.class))).thenReturn(sampleMatchResponse());

        UUID tournamentId = UUID.randomUUID();
        UUID player1 = UUID.randomUUID();
        UUID player2 = UUID.randomUUID();
        CreateMatchRequest request = new CreateMatchRequest(
            MatchMode.TOURNAMENT,
            GameType.SINGLES,
            tournamentId,
            player1,
            11,
            3,
            true,
            List.of(
                new CreateMatchTeamRequest(List.of(player1)),
                new CreateMatchTeamRequest(List.of(player2))
            )
        );

        mockMvc.perform(post("/api/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Match created"))
            .andExpect(jsonPath("$.data.matchId").exists())
            .andExpect(jsonPath("$.data.mode").value("TOURNAMENT"))
            .andExpect(jsonPath("$.data.gameType").value("SINGLES"))
            .andExpect(jsonPath("$.data.pointsToWin").value(11))
            .andExpect(jsonPath("$.data.bestOf").value(3))
            .andExpect(jsonPath("$.data.winByTwo").value(true))
            .andExpect(jsonPath("$.data.score1").value(0))
            .andExpect(jsonPath("$.data.score2").value(0))
            .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
            .andExpect(jsonPath("$.data.teams[0].players[0].userId").exists());
    }

    @Test
    void getMatchShouldReturnTeamBasedResponse() throws Exception {
        MatchResponse response = sampleMatchResponse();
        when(matchService.getMatch(response.matchId())).thenReturn(response);

        mockMvc.perform(get("/api/matches/{id}", response.matchId())
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Match fetched"))
            .andExpect(jsonPath("$.data.matchId").value(response.matchId().toString()))
            .andExpect(jsonPath("$.data.teams[0].teamNo").value(1))
            .andExpect(jsonPath("$.data.teams[0].players[0].userId").exists());
    }

    private MatchResponse sampleMatchResponse() {
        UUID matchId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        UUID scorekeeperId = UUID.randomUUID();
        UUID team1Player = UUID.randomUUID();
        UUID team2Player = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        return new MatchResponse(
            matchId,
            tournamentId,
            MatchMode.TOURNAMENT,
            GameType.SINGLES,
            11,
            3,
            true,
            scorekeeperId,
            0,
            0,
            null,
            "Round 1",
            MatchStatus.SCHEDULED,
            List.of(
                new MatchTeamResponse(1, List.of(new MatchTeamPlayerResponse(team1Player, "Player One", 1))),
                new MatchTeamResponse(2, List.of(new MatchTeamPlayerResponse(team2Player, "Player Two", 1)))
            ),
            now,
            now
        );
    }
}
