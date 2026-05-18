package com.pickelton.backend.user.service;

import java.util.UUID;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.config.CacheConfig;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.user.dto.UpdateUserRequest;
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
    @CacheEvict(cacheNames = {CacheConfig.USERS_BY_ID, CacheConfig.USERS_BY_EMAIL}, allEntries = true)
    public User save(User user) {
        return userRepository.save(user);
    }

    @Cacheable(cacheNames = CacheConfig.USERS_BY_ID, key = "#id")
    public User findById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Cacheable(cacheNames = CacheConfig.USERS_BY_EMAIL, key = "#email.toLowerCase()")
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Cacheable(cacheNames = CacheConfig.USERS_BY_EMAIL, key = "#email.toLowerCase()", unless = "#result == null")
    public User findNullableByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim()).orElse(null);
    }

    public User findNullableByGoogleSubject(String googleSubject) {
        return userRepository.findByGoogleSubject(googleSubject).orElse(null);
    }

    public UserDTO getMyProfile(UUID userId) {
        return toDto(findById(userId));
    }

    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.USERS_BY_ID, CacheConfig.USERS_BY_EMAIL}, allEntries = true)
    public UserDTO updateMyProfile(UUID userId, UpdateUserRequest request) {
        User user = findById(userId);
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
            user.setPhoneNumber(request.phoneNumber());
            user.setPhoneVerified(false);
        }
        return toDto(userRepository.save(user));
    }

    public UserStatsDTO getUserStats(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        long wins = matchRepository.countWinsByUserId(userId, MatchStatus.COMPLETED);
        long losses = matchRepository.countLossesByUserId(userId, MatchStatus.COMPLETED);
        long total = matchRepository.countTotalMatchesByUserId(userId);
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
            user.getCreatedAt()
        );
    }
}
