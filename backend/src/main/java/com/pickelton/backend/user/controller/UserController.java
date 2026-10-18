package com.pickelton.backend.user.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.user.dto.FollowResponse;
import com.pickelton.backend.user.dto.PlayerSuggestionResponse;
import com.pickelton.backend.user.dto.UpdateUserRequest;
import com.pickelton.backend.user.dto.PublicUserResponse;
import com.pickelton.backend.user.dto.UserDTO;
import com.pickelton.backend.user.dto.UserSearchResponse;
import com.pickelton.backend.user.dto.UserStatsDTO;
import com.pickelton.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> me() {
        UserDTO dto = userService.getMyProfile(currentUserService.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> updateMe(@Valid @RequestBody UpdateUserRequest request) {
        UserDTO dto = userService.updateMyProfile(currentUserService.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok(dto, "Profile updated"));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> search(
        @RequestParam String query,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(userService.searchUsers(query, limit)));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PlayerSuggestionResponse>>> suggestions(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getSuggestions(currentUserService.getUserId(), limit)));
    }

    @PostMapping("/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FollowResponse>> follow(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.follow(currentUserService.getUserId(), id), "Player followed"));
    }

    @DeleteMapping("/{id}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FollowResponse>> unfollow(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.unfollow(currentUserService.getUserId(), id), "Player unfollowed"));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserStatsDTO>> stats(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserStats(id)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PublicUserResponse>> publicProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPublicProfile(id)));
    }
}
