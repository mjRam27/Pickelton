package com.pickelton.backend.host.controller;

import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.host.dto.HostVerificationResponse;
import com.pickelton.backend.host.dto.ReviewHostVerificationRequest;
import com.pickelton.backend.host.service.HostVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/host-verifications")
@RequiredArgsConstructor
public class AdminHostVerificationController {

    private final HostVerificationService hostVerificationService;

    @GetMapping("/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<HostVerificationResponse>>> getPending(
        @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(hostVerificationService.getPending(adminKey, page, size)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HostVerificationResponse>> review(
        @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
        @PathVariable UUID id,
        @Valid @RequestBody ReviewHostVerificationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(hostVerificationService.review(adminKey, id, request), "Host verification reviewed"));
    }
}
