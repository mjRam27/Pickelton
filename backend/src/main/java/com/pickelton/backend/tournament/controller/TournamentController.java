package com.pickelton.backend.tournament.controller;

import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.tournament.dto.CreateTournamentRequest;
import com.pickelton.backend.tournament.dto.TournamentResponse;
import com.pickelton.backend.tournament.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @PostMapping
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(@Valid @RequestBody CreateTournamentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tournament created", tournamentService.createTournament(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TournamentResponse>>> getTournaments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Tournaments fetched", tournamentService.getTournaments(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournament(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Tournament fetched", tournamentService.getTournament(id)));
    }
}