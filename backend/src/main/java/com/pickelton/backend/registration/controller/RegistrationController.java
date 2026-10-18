package com.pickelton.backend.registration.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.registration.dto.HostRegistrationResponse;
import com.pickelton.backend.registration.dto.RegisterRequest;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.ReviewPaymentRequest;
import com.pickelton.backend.registration.dto.SubmitPaymentRequest;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
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
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
        @PathVariable("id") UUID tournamentId, @Valid @RequestBody(required = false) RegisterRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Tournament registration created", registrationService.register(tournamentId, request)));
    }

    // The signed-in player's registration for this tournament, or null data when not registered.
    @GetMapping("/{id}/registration")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getMine(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.getMineFor(tournamentId).orElse(null)));
    }

    @PostMapping("/{id}/registration/payment")
    public ResponseEntity<ApiResponse<RegistrationResponse>> submitPayment(
        @PathVariable("id") UUID tournamentId, @Valid @RequestBody SubmitPaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.submitPayment(tournamentId, request), "Payment reference submitted"));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelMine(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.cancelMine(tournamentId), "Tournament registration cancelled"));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<List<TournamentParticipantResponse>>> getParticipants(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success("Participants fetched", registrationService.getParticipants(tournamentId)));
    }

    // Host only: every registration with contact details, answers and payment state.
    @GetMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<List<HostRegistrationResponse>>> getForHost(@PathVariable("id") UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.getForHost(tournamentId)));
    }

    @PatchMapping("/{id}/registrations/{registrationId}/payment")
    public ResponseEntity<ApiResponse<HostRegistrationResponse>> reviewPayment(
        @PathVariable("id") UUID tournamentId, @PathVariable UUID registrationId, @Valid @RequestBody ReviewPaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.reviewPayment(tournamentId, registrationId, request), "Payment reviewed"));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelParticipant(
        @PathVariable("id") UUID tournamentId, @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(registrationService.cancelParticipant(tournamentId, userId),
            "Participant registration cancelled"));
    }
}
