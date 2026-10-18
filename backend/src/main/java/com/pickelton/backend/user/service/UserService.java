package com.pickelton.backend.user.service;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.config.CacheConfig;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.user.dto.FollowResponse;
import com.pickelton.backend.user.dto.PlayerSuggestionResponse;
import com.pickelton.backend.user.dto.UpdateUserRequest;
import com.pickelton.backend.user.dto.PublicUserResponse;
import com.pickelton.backend.user.dto.UserDTO;
import com.pickelton.backend.user.dto.UserSearchResponse;
import com.pickelton.backend.user.dto.UserStatsDTO;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.entity.UserFollow;
import com.pickelton.backend.user.repository.UserFollowRepository;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.hibernate.Hibernate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final UserFollowRepository userFollowRepository;

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.USERS_BY_ID, allEntries = true)
    public User save(User user) {
        return userRepository.save(user);
    }

    // The cache stores the user as JSON. If the same user was already loaded lazily in this transaction
    // (e.g. as a tournament's host), findById returns a Hibernate proxy, which can't be serialized; unwrap it.
    @Cacheable(cacheNames = CacheConfig.USERS_BY_ID, key = "#id")
    public User findById(UUID id) {
        return userRepository.findById(id)
            .map(user -> Hibernate.unproxy(user, User.class))
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

    // Loads the user from the database, not the cache: the cached copy has no password, and saving it would wipe it.
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.USERS_BY_ID, allEntries = true)
    public void markPhoneVerified(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPhoneVerified(true);
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

    public List<UserSearchResponse> searchUsers(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        int capped = Math.min(Math.max(limit, 1), 20);
        return userRepository.searchByNameEmailOrPhone(query.trim(), PageRequest.of(0, capped))
            .stream()
            .map(u -> new UserSearchResponse(u.getId(), u.getName(), u.getEmail(), u.getPhoneNumber()))
            .toList();
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

    public List<PlayerSuggestionResponse> getSuggestions(UUID userId, int limit) {
        int capped = Math.min(Math.max(limit, 1), 20);
        return userFollowRepository.findSuggestions(userId, capped).stream()
            .map(row -> new PlayerSuggestionResponse(row.getUserId(), row.getName(), row.getAvatarUrl(), row.getCity(),
                row.getLastPlayedAt(), Boolean.TRUE.equals(row.getFollowing()), row.getReason()))
            .toList();
    }

    @Transactional
    public FollowResponse follow(UUID followerId, UUID followedId) {
        if (followerId.equals(followedId)) {
            throw new BadRequestException("You cannot follow yourself");
        }
        if (!userRepository.existsById(followedId)) {
            throw new ResourceNotFoundException("User not found");
        }
        var id = new UserFollow.Id(followerId, followedId);
        if (!userFollowRepository.existsById(id)) {
            userFollowRepository.save(new UserFollow(followerId, followedId));
        }
        return new FollowResponse(true);
    }

    @Transactional
    public FollowResponse unfollow(UUID followerId, UUID followedId) {
        userFollowRepository.deleteById(new UserFollow.Id(followerId, followedId));
        return new FollowResponse(false);
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
