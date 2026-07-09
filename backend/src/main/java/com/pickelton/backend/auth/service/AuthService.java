package com.pickelton.backend.auth.service;

import com.pickelton.backend.auth.dto.AuthResponse;
import com.pickelton.backend.auth.dto.GoogleLoginRequest;
import com.pickelton.backend.auth.dto.LoginRequest;
import com.pickelton.backend.auth.dto.MeResponse;
import com.pickelton.backend.auth.dto.RefreshTokenRequest;
import com.pickelton.backend.auth.dto.RegisterRequest;
import com.pickelton.backend.auth.dto.VerifyCodeRequest;
import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.PlatformRole;
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
    private final VerificationCodeService verificationCodeService;
    private final GoogleIdentityService googleIdentityService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new BadRequestException("Phone number is already registered");
        }

        User user = User.builder()
            .name(request.name())
            .email(email)
            .phoneNumber(request.phoneNumber())
            .dateOfBirth(request.dateOfBirth())
            .password(passwordEncoder.encode(request.password()))
            .emailVerified(false)
            .phoneVerified(false)
            .authProvider("LOCAL")
            .role(PlatformRole.USER)
            .build();

        User saved = userService.save(user);
        verificationCodeService.issuePhone(saved.getId(), saved.getPhoneNumber());
        return issueSession(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();
        User user = userService.findNullableByEmail(email);
        if (user == null) {
            throw new BadRequestException(INVALID_CREDENTIALS);
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException(INVALID_CREDENTIALS);
        }
        return issueSession(user);
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleIdentityService.GoogleIdentity identity = googleIdentityService.verify(request.idToken());
        User user = userService.findNullableByGoogleSubject(identity.subject());
        boolean newUser = false;
        if (user == null) {
            user = userService.findNullableByEmail(identity.email());
        }
        if (user == null) {
            if (request.phoneNumber() == null || request.phoneNumber().isBlank() || request.dateOfBirth() == null) {
                throw new BadRequestException("Phone number and date of birth are required for first Google login");
            }
            if (request.dateOfBirth().isAfter(java.time.LocalDate.now().minusYears(13))) {
                throw new BadRequestException("You must be at least 13 years old to register");
            }
            if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
                throw new BadRequestException("Phone number is already registered");
            }
            user = User.builder()
                .name(identity.name())
                .email(identity.email())
                .phoneNumber(request.phoneNumber())
                .dateOfBirth(request.dateOfBirth())
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .emailVerified(identity.emailVerified())
                .phoneVerified(false)
                .authProvider("GOOGLE")
                .googleSubject(identity.subject())
                .role(PlatformRole.USER)
                .build();
            newUser = true;
        } else if (user.getGoogleSubject() == null || user.getGoogleSubject().isBlank()) {
            user.setGoogleSubject(identity.subject());
            user.setEmailVerified(true);
            user.setAuthProvider(user.getAuthProvider() == null ? "GOOGLE" : user.getAuthProvider());
        }
        User saved = userService.save(user);
        if (newUser) {
            verificationCodeService.issuePhone(saved.getId(), saved.getPhoneNumber());
        }
        return issueSession(saved);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        java.util.UUID userId = refreshTokenService.consumeForRotation(request.refreshToken());
        User user = userService.findById(userId);
        return issueSession(user);
    }

    public void logout(String token, String refreshToken) {
        if (token == null || token.isBlank()) {
            return;
        }
        if (!jwtUtil.validateToken(token)) {
            throw new BadRequestException("Invalid access token");
        }
        blacklistService.blacklist(token, jwtUtil.extractExpiration(token));
        refreshTokenService.revoke(refreshToken);
    }

    @Transactional(readOnly = true)
    public MeResponse me() {
        User user = currentUserService.getUser();
        return new MeResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getDateOfBirth(),
            user.isEmailVerified(),
            user.isPhoneVerified(),
            user.getRole(),
            user.getCreatedAt()
        );
    }

    public void requestPhoneVerificationCode() {
        User user = currentUserService.getCurrentUser();
        verificationCodeService.issuePhone(user.getId(), user.getPhoneNumber());
    }

    public void verifyPhoneCode(VerifyCodeRequest request) {
        User user = currentUserService.getCurrentUser();
        verificationCodeService.verifyPhone(user.getId(), request.code());
        user.setPhoneVerified(true);
        userService.save(user);
    }

    private AuthResponse issueSession(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        RefreshTokenService.IssuedRefreshToken refreshToken = refreshTokenService.issue(user.getId());
        return new AuthResponse(
            token,
            refreshToken.token(),
            jwtUtil.getExpirationMs(),
            refreshToken.expiresInMs(),
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getDateOfBirth(),
            user.isEmailVerified(),
            user.isPhoneVerified(),
            user.getRole()
        );
    }
}
