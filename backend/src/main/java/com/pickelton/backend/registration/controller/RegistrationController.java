package com.pickelton.backend.registration.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.registration.dto.ReviewRegistrationRequest;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registrationform.dto.SubmitRegistrationRequest;
import com.pickelton.backend.registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping("/registrations/me")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getMyRegistrations() {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.getMine()));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success("Tournament registration created", registrationService.register(tournamentId)));
    }

    @PostMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<RegistrationResponse>> submit(
        @PathVariable("id") UUID tournamentId, @Valid @RequestBody SubmitRegistrationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Tournament registration submitted", registrationService.submit(tournamentId, request)));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelMine(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.cancelMine(tournamentId), "Tournament registration cancelled"));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<List<TournamentParticipantResponse>>> getParticipants(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success("Participants fetched", registrationService.getParticipants(tournamentId)));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelParticipant(
        @PathVariable("id") UUID tournamentId, @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.cancelParticipant(tournamentId, userId),
            "Participant registration cancelled"));
    }

    @PatchMapping("/{id}/registrations/{registrationId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> review(
        @PathVariable("id") UUID tournamentId,
        @PathVariable UUID registrationId,
        @Valid @RequestBody ReviewRegistrationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.review(tournamentId, registrationId, request), "Registration reviewed"));
    }
}
