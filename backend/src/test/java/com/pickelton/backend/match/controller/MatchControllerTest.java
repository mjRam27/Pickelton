package com.pickelton.backend.match.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickelton.backend.config.RateLimitInterceptor;
import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.MatchType;
import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.match.dto.AddPointRequest;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.MatchParticipantResponse;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.MatchScorecardResponse;
import com.pickelton.backend.match.service.MatchService;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
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
    void getScorecardShouldReturnSnapshot() throws Exception {
        when(matchService.getScorecard(any(UUID.class))).thenReturn(sampleScorecard());

        mockMvc.perform(get("/api/matches/{id}/scorecard", UUID.randomUUID()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.round").value("Round 1"))
            .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    void addPointShouldReturnUpdatedScorecard() throws Exception {
        MatchScorecardResponse scorecard = sampleScorecard();
        when(matchService.addPoint(any(UUID.class), any(AddPointRequest.class))).thenReturn(scorecard);

        mockMvc.perform(post("/api/matches/{id}/scorecard/point", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AddPointRequest("A"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.scores.A").value(5))
            .andExpect(jsonPath("$.data.scores.B").value(3));
    }

    @Test
    void createCasualMatchWithoutTournamentIdShouldPassValidation() throws Exception {
        when(matchService.createMatch(any(CreateMatchRequest.class))).thenReturn(sampleCreatedMatch());

        String requestJson = """
            {
              "mode":"CASUAL",
              "participants":[
                {"userId":"11111111-1111-1111-1111-111111111111","teamCode":"A","role":"PLAYER"},
                {"userId":"22222222-2222-2222-2222-222222222222","teamCode":"B","role":"PLAYER"}
              ],
              "rules":{"pointsToWin":11},
              "round":"Friendly Match"
            }
            """;

        mockMvc.perform(post("/api/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.round").value("Friendly Match"));
    }

    private MatchScorecardResponse sampleScorecard() {
        UUID matchId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        UUID scorekeeperId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        return new MatchScorecardResponse(
            matchId,
            tournamentId,
            "Round 1",
            MatchStatus.IN_PROGRESS,
            "Center Court",
            now,
            List.of(new MatchParticipantResponse(UUID.randomUUID(), UUID.randomUUID(), "Player A", "A",
                ParticipantRole.PLAYER, InvitationStatus.ACCEPTED)),
            Map.of("A", 5, "B", 3),
            1,
            11,
            3,
            true,
            scorekeeperId,
            null,
            8L,
            now,
            now
        );
    }

    private MatchResponse sampleCreatedMatch() {
        OffsetDateTime now = OffsetDateTime.now();
        return new MatchResponse(
            UUID.randomUUID(),
            null,
            UUID.fromString("11111111-1111-1111-1111-111111111111"),
            UUID.fromString("22222222-2222-2222-2222-222222222222"),
            0,
            0,
            null,
            "Friendly Match",
            MatchStatus.SCHEDULED,
            SportType.PICKLEBALL,
            MatchType.SINGLES,
            null,
            now,
            Map.of("pointsToWin", 11),
            List.of(),
            Map.of("A", 0, "B", 0),
            1,
            List.of(),
            0L,
            now,
            now
        );
    }
}
