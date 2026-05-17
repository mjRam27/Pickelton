package com.pickelton.backend.user.service;

import java.util.UUID;

import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.user.dto.UpdateUserRequest;
import com.pickelton.backend.user.dto.UserDTO;
import com.pickelton.backend.user.dto.UserStatsDTO;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDTO getMyProfile(UUID userId) {
        return toDto(findById(userId));
    }

    @Transactional
    public UserDTO updateMyProfile(UUID userId, UpdateUserRequest request) {
        User user = findById(userId);
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.sportType() != null) {
            user.setSportType(request.sportType().isBlank() ? null : request.sportType());
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
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getSportType(), user.getCreatedAt());
    }
}
