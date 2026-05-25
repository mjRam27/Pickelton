package com.pickelton.backend.user.controller;

import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.user.dto.UpdateUserRequest;
import com.pickelton.backend.user.dto.PublicUserResponse;
import com.pickelton.backend.user.dto.UserDTO;
import com.pickelton.backend.user.dto.UserStatsDTO;
import com.pickelton.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
