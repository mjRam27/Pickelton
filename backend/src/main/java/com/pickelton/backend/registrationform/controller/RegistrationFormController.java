package com.pickelton.backend.registrationform.controller;

import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.registrationform.dto.RegistrationFormResponse;
import com.pickelton.backend.registrationform.dto.SaveRegistrationFormRequest;
import com.pickelton.backend.registrationform.service.RegistrationFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/registration-form")
@RequiredArgsConstructor
public class RegistrationFormController {

    private final RegistrationFormService registrationFormService;

    @GetMapping
    public ResponseEntity<ApiResponse<RegistrationFormResponse>> latest(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationFormService.getLatest(tournamentId)));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<RegistrationFormResponse>> published(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationFormService.getPublished(tournamentId)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<RegistrationFormResponse>> saveDraft(
        @PathVariable UUID tournamentId, @Valid @RequestBody SaveRegistrationFormRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(registrationFormService.saveDraft(tournamentId, request), "Registration form saved"));
    }

    @PostMapping("/publish")
    public ResponseEntity<ApiResponse<RegistrationFormResponse>> publish(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.ok(registrationFormService.publish(tournamentId), "Registration form published"));
    }
}
