package com.pickelton.backend.user.service;

import java.util.UUID;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.config.CacheConfig;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.user.dto.UpdateUserRequest;
import com.pickelton.backend.user.dto.PublicUserResponse;
import com.pickelton.backend.user.dto.UserDTO;
import com.pickelton.backend.user.dto.UserStatsDTO;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.USERS_BY_ID, allEntries = true)
    public User save(User user) {
        return userRepository.save(user);
    }

    @Cacheable(cacheNames = CacheConfig.USERS_BY_ID, key = "#id")
    public User findById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findNullableByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim()).orElse(null);
    }

    public User findNullableByGoogleSubject(String googleSubject) {
        return userRepository.findByGoogleSubject(googleSubject).orElse(null);
    }

    public UserDTO getMyProfile(UUID userId) {
        return toDto(findById(userId));
    }

    public PublicUserResponse getPublicProfile(UUID userId) {
        User user = findById(userId);
        return new PublicUserResponse(
            user.getId(),
            user.getName(),
            user.getBio(),
            user.getAvatarUrl(),
            user.getCity(),
            getUserStats(userId),
            user.getCreatedAt()
        );
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.USERS_BY_ID, allEntries = true)
    public UserDTO updateMyProfile(UUID userId, UpdateUserRequest request) {
        User user = findById(userId);
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()
            && !request.phoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumberAndIdNot(request.phoneNumber(), userId)) {
                throw new com.pickelton.backend.common.exception.BadRequestException("Phone number is already registered");
            }
            user.setPhoneNumber(request.phoneNumber());
            user.setPhoneVerified(false);
        }
        if (request.bio() != null) {
            user.setBio(request.bio().trim());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().trim());
        }
        if (request.city() != null) {
            user.setCity(request.city().trim());
        }
        return toDto(userRepository.save(user));
    }

    public UserStatsDTO getUserStats(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        long wins = matchRepository.countWinsByUserId(userId, MatchStatus.COMPLETED);
        long losses = matchRepository.countLossesByUserId(userId, MatchStatus.COMPLETED);
        long total = matchRepository.countTotalMatchesByUserIdAndStatus(userId, MatchStatus.COMPLETED);
        return new UserStatsDTO(userId, wins, losses, total);
    }

    private UserDTO toDto(User user) {
        return new UserDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getDateOfBirth(),
            user.isEmailVerified(),
            user.isPhoneVerified(),
            user.getBio(),
            user.getAvatarUrl(),
            user.getCity(),
            user.getCreatedAt()
        );
    }
}
