package com.pickelton.backend.community.controller;

import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.community.dto.CommunityPostResponse;
import com.pickelton.backend.community.dto.CreatePostRequest;
import com.pickelton.backend.community.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<PageResponse<CommunityPostResponse>>> getFeed(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Community feed fetched", communityService.getFeed(page, size)));
    }

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(@Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Post created", communityService.createPost(request)));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable UUID id) {
        communityService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Post deleted"));
    }
}
