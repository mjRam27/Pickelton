package com.pickelton.backend.host.controller;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.host.dto.HostVerificationResponse;
import com.pickelton.backend.host.dto.KycUploadResponse;
import com.pickelton.backend.host.dto.SubmitHostVerificationRequest;
import com.pickelton.backend.host.service.HostVerificationService;
import com.pickelton.backend.host.service.KycStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/host-verifications")
@RequiredArgsConstructor
public class HostVerificationController {

    private final HostVerificationService hostVerificationService;
    private final KycStorageService kycStorageService;
    private final CurrentUserService currentUserService;

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<KycUploadResponse>> upload(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(kycStorageService.store(currentUserService.getUserId(), file), "Document uploaded"));
    }

    @PostMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HostVerificationResponse>> submitMine(
        @Valid @RequestBody SubmitHostVerificationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(hostVerificationService.submitMine(request), "Host verification submitted"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HostVerificationResponse>> getMine() {
        return hostVerificationService.getMine()
            .map(response -> ResponseEntity.ok(ApiResponse.ok(response)))
            .orElseGet(() -> ResponseEntity.ok(ApiResponse.ok(null, "Host verification not submitted")));
    }
}
