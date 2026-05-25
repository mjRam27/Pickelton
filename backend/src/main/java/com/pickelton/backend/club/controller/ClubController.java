package com.pickelton.backend.club.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.club.dto.ClubMemberResponse;
import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.dto.CreateClubRequest;
import com.pickelton.backend.club.dto.UpdateClubMemberRoleRequest;
import com.pickelton.backend.club.dto.UpdateClubRequest;
import com.pickelton.backend.club.service.ClubService;
import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.response.PageResponse;
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
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Clubs fetched", clubService.getClubs(search, page, size)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ClubResponse>>> getMyClubs() {
        return ResponseEntity.ok(ApiResponse.ok(clubService.getMyClubs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponse>> getClub(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Club fetched", clubService.getClub(id)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponse>> updateClub(
        @PathVariable UUID id, @Valid @RequestBody UpdateClubRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(clubService.updateClub(id, request), "Club updated"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ClubMemberResponse>> joinClub(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Joined club", clubService.joinClub(id)));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveClub(@PathVariable UUID id) {
        clubService.leaveClub(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Left club"));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<ClubMemberResponse>>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(clubService.getMembers(id)));
    }

    @PatchMapping("/{id}/members/{userId}/role")
    public ResponseEntity<ApiResponse<ClubMemberResponse>> updateMemberRole(
        @PathVariable UUID id, @PathVariable UUID userId, @Valid @RequestBody UpdateClubMemberRoleRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(clubService.updateMemberRole(id, userId, request), "Club member role updated"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable UUID id, @PathVariable UUID userId) {
        clubService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Club member removed"));
    }
}
