package com.pickelton.backend.auth.service;

import java.util.Optional;

import com.pickelton.backend.auth.dto.AuthResponse;
import com.pickelton.backend.auth.dto.LoginRequest;
import com.pickelton.backend.auth.dto.MeResponse;
import com.pickelton.backend.auth.dto.RegisterRequest;
import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.security.JwtBlacklistService;
import com.pickelton.backend.security.JwtUtil;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import com.pickelton.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid credentials";

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtBlacklistService blacklistService;
    private final CurrentUserService currentUserService;

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
            .name(request.name())
            .email(email)
            .password(passwordEncoder.encode(request.password()))
            .sportType(request.sportType())
            .build();

        User saved = userService.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());
        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();
        Optional<User> maybeUser = userRepository.findByEmail(email);
        if (maybeUser.isEmpty()) {
            throw new BadRequestException(INVALID_CREDENTIALS);
        }
        User user = maybeUser.get();
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException(INVALID_CREDENTIALS);
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }

    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            blacklistService.blacklist(token, jwtUtil.extractExpiration(token));
        } catch (Exception ex) {
            log.debug("Logout called with invalid token");
        }
    }

    @Transactional(readOnly = true)
    public MeResponse me() {
        User user = currentUserService.getUser();
        return new MeResponse(user.getId(), user.getName(), user.getEmail(), user.getSportType(), user.getCreatedAt());
    }
}
