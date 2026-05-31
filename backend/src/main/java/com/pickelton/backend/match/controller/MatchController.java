package com.pickelton.backend.match.controller;

import java.util.UUID;
import java.util.List;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.match.dto.AddPointRequest;
import com.pickelton.backend.match.dto.AssignScorekeeperRequest;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.LiveMatchStateResponse;
import com.pickelton.backend.match.dto.ManualScoreCorrectionRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.MatchScorecardResponse;
import com.pickelton.backend.match.dto.ScorekeeperSearchResponse;
import com.pickelton.backend.match.dto.UpdateMatchScoreRequest;
import com.pickelton.backend.match.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<ApiResponse<MatchResponse>> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Match created", matchService.createMatch(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> getMatch(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Match fetched", matchService.getMatch(id)));
    }

    @GetMapping("/{id}/live-score")
    public ResponseEntity<ApiResponse<LiveMatchStateResponse>> getLiveScore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Live match state fetched", matchService.getLiveScore(id)));
    }

    @GetMapping("/{id}/scorecard")
    public ResponseEntity<ApiResponse<MatchScorecardResponse>> getScorecard(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Match scorecard fetched", matchService.getScorecard(id)));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getTournamentMatches(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(matchService.getTournamentMatches(tournamentId)));
    }

    @GetMapping("/tournament/{tournamentId}/scorekeepers/search")
    public ResponseEntity<ApiResponse<List<ScorekeeperSearchResponse>>> searchScorekeepers(
        @PathVariable UUID tournamentId,
        @RequestParam String query
    ) {
        return ResponseEntity.ok(ApiResponse.ok(matchService.searchScorekeepers(tournamentId, query)));
    }

    @PatchMapping("/{id}/scorekeeper")
    public ResponseEntity<ApiResponse<MatchResponse>> assignScorekeeper(
        @PathVariable UUID id,
        @Valid @RequestBody AssignScorekeeperRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Scorekeeper assigned", matchService.assignScorekeeper(id, request)));
    }

    @PostMapping("/{id}/scorecard/point")
    public ResponseEntity<ApiResponse<MatchScorecardResponse>> addPoint(
        @PathVariable UUID id,
        @Valid @RequestBody AddPointRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Point added", matchService.addPoint(id, request)));
    }

    @PostMapping("/{id}/scorecard/undo")
    public ResponseEntity<ApiResponse<MatchScorecardResponse>> undoLastScore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Last score action undone", matchService.undoLastScore(id)));
    }

    @PostMapping("/{id}/scorecard/correction")
    public ResponseEntity<ApiResponse<MatchScorecardResponse>> manualCorrection(
        @PathVariable UUID id,
        @Valid @RequestBody ManualScoreCorrectionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Score corrected", matchService.manualCorrection(id, request)));
    }

    @PostMapping("/{id}/scorecard/complete")
    public ResponseEntity<ApiResponse<MatchScorecardResponse>> completeMatch(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Match completed", matchService.completeMatch(id)));
    }

    @PatchMapping("/{id}/score")
    public ResponseEntity<ApiResponse<MatchResponse>> updateScore(@PathVariable UUID id, @Valid @RequestBody UpdateMatchScoreRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Match score updated", matchService.updateScore(id, request)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<MatchResponse>> cancelMatch(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(matchService.cancelMatch(id), "Match cancelled"));
    }
}
