package com.pickelton.backend.auth.service;

import com.pickelton.backend.auth.dto.AuthResponse;
import com.pickelton.backend.auth.dto.LoginRequest;
import com.pickelton.backend.auth.dto.MeResponse;
import com.pickelton.backend.auth.dto.RegisterRequest;
import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.mapper.UserMapper;
import com.pickelton.backend.security.JwtUtil;
import com.pickelton.backend.user.dto.UserResponse;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import com.pickelton.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CurrentUserService currentUserService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
            .name(request.name())
            .email(request.email().toLowerCase())
            .password(passwordEncoder.encode(request.password()))
            .sportType(request.sportType())
            .build();

        User savedUser = userService.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return new AuthResponse("Bearer", token, userMapper.toResponse(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
        );
        User user = userService.findByEmail(request.email().toLowerCase());
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse("Bearer", token, userMapper.toResponse(user));
    }

    @Transactional(readOnly = true)
    public MeResponse me() {
        User user = currentUserService.getCurrentUser();
        UserResponse response = userMapper.toResponse(user);
        return new MeResponse(response);
    }
}