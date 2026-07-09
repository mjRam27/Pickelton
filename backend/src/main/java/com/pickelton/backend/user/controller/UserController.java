package com.pickelton.backend.user.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.user.dto.UpdateUserRequest;
import com.pickelton.backend.user.dto.PublicUserResponse;
import com.pickelton.backend.user.dto.UserDTO;
import com.pickelton.backend.user.dto.UserSearchResponse;
import com.pickelton.backend.user.dto.UserStatsDTO;
import com.pickelton.backend.user.service.UserService;
import com.pickelton.backend.storage.dto.StorageUploadResponse;
import com.pickelton.backend.storage.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;
    private final StorageService storageService;

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

    @PostMapping("/me/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        StorageUploadResponse upload = storageService.upload("profile-avatars", file);
        UserDTO dto = userService.updateAvatar(currentUserService.getUserId(), upload.url());
        return ResponseEntity.ok(ApiResponse.ok(dto, "Profile avatar updated"));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> search(
        @RequestParam String query,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(userService.searchUsers(query, limit)));
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
