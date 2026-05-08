package com.pickelton.backend.club.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.service.ClubService;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.user.dto.UserResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ClubController.class)
class ClubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClubService clubService;

    @Test
    void getClubsShouldReturnPaginatedResponse() throws Exception {
        when(clubService.getClubs(anyInt(), anyInt())).thenReturn(samplePageResponse());

        mockMvc.perform(get("/api/clubs").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].name").value("Pickelton Club"));
    }

    private PageResponse<ClubResponse> samplePageResponse() {
        return new PageResponse<>(
            List.of(new ClubResponse(
                UUID.randomUUID(),
                "Pickelton Club",
                "Community club",
                "Bangalore",
                new UserResponse(UUID.randomUUID(), "Admin", "admin@example.com", SportType.PICKLEBALL,
                    LocalDateTime.now(), LocalDateTime.now()),
                12L,
                LocalDateTime.now(),
                LocalDateTime.now()
            )),
            0,
            20,
            1,
            1
        );
    }
}