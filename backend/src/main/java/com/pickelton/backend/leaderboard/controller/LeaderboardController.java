package com.pickelton.backend.leaderboard.controller;

import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.leaderboard.dto.ClubLeaderboardEntryResponse;
import com.pickelton.backend.leaderboard.dto.LeaderboardResponse;
import com.pickelton.backend.leaderboard.dto.PlayerLeaderboardEntryResponse;
import com.pickelton.backend.leaderboard.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/api/leaderboards/players")
    public ResponseEntity<ApiResponse<java.util.List<PlayerLeaderboardEntryResponse>>> getPlayerLeaderboard(
        @RequestParam(defaultValue = "PICKLEBALL") SportType sportType
    ) {
        return ResponseEntity.ok(ApiResponse.ok(leaderboardService.getPlayerLeaderboard(sportType)));
    }

    @GetMapping("/api/leaderboards/clubs")
    public ResponseEntity<ApiResponse<java.util.List<ClubLeaderboardEntryResponse>>> getClubLeaderboard(
        @RequestParam(defaultValue = "PICKLEBALL") SportType sportType
    ) {
        return ResponseEntity.ok(ApiResponse.ok(leaderboardService.getClubLeaderboard(sportType)));
    }

    @GetMapping("/api/tournaments/{id}/leaderboard")
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getLeaderboard(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success("Leaderboard fetched", leaderboardService.getLeaderboard(tournamentId)));
    }
}
