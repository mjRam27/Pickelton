package com.pickelton.backend.registration.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registration.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments/{id}")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success("Tournament registration created", registrationService.register(tournamentId)));
    }

    @GetMapping("/participants")
    public ResponseEntity<ApiResponse<List<TournamentParticipantResponse>>> getParticipants(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success("Participants fetched", registrationService.getParticipants(tournamentId)));
    }
}