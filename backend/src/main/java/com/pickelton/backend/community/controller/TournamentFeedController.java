package com.pickelton.backend.community.controller;

import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.community.dto.CommunityPostResponse;
import com.pickelton.backend.community.dto.TournamentPostRequest;
import com.pickelton.backend.community.service.TournamentFeedService;
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
@RequestMapping("/api/tournaments/{id}/posts")
@RequiredArgsConstructor
public class TournamentFeedController {

    private final TournamentFeedService feedService;

    // Public: the feed is readable from a shared tournament link.
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CommunityPostResponse>>> getFeed(
        @PathVariable("id") UUID tournamentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feedService.getFeed(tournamentId, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(
        @PathVariable("id") UUID tournamentId, @Valid @RequestBody TournamentPostRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feedService.createPost(tournamentId, request), "Post published"));
    }

    @PatchMapping("/{postId}/pin")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> setPinned(
        @PathVariable("id") UUID tournamentId, @PathVariable UUID postId, @RequestBody Map<String, Boolean> body
    ) {
        boolean pinned = Boolean.TRUE.equals(body.get("pinned"));
        return ResponseEntity.ok(ApiResponse.ok(feedService.setPinned(tournamentId, postId, pinned), pinned ? "Post pinned" : "Post unpinned"));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable("id") UUID tournamentId, @PathVariable UUID postId) {
        feedService.deletePost(tournamentId, postId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Post deleted"));
    }
}
