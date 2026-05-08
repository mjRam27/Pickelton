package com.pickelton.backend.club.controller;

import java.util.UUID;

import com.pickelton.backend.club.dto.ClubMemberResponse;
import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.dto.CreateClubRequest;
import com.pickelton.backend.club.service.ClubService;
import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.response.PageResponse;
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
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @PostMapping
    public ResponseEntity<ApiResponse<ClubResponse>> createClub(@Valid @RequestBody CreateClubRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Club created", clubService.createClub(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ClubResponse>>> getClubs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Clubs fetched", clubService.getClubs(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponse>> getClub(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Club fetched", clubService.getClub(id)));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ClubMemberResponse>> joinClub(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Joined club", clubService.joinClub(id)));
    }
}