package com.pickelton.backend.common.service;

import java.util.UUID;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserService userService;

    public boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated()
            && !"anonymousUser".equals(auth.getPrincipal());
    }

    public UUID getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResourceNotFoundException("Not authenticated");
        }
        try {
            return UUID.fromString(auth.getName());
        } catch (IllegalArgumentException ex) {
            throw new ResourceNotFoundException("Not authenticated");
        }
    }

    public User getUser() {
        return userService.findById(getUserId());
    }

    public User getCurrentUser() {
        return getUser();
    }
}
