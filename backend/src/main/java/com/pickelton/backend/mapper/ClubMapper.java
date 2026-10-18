package com.pickelton.backend.mapper;

import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.entity.Club;
import org.springframework.stereotype.Component;

@Component
public class ClubMapper {

    private final UserMapper userMapper;

    public ClubMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public ClubResponse toResponse(Club club, long memberCount) {
        return toResponse(club, memberCount, null);
    }

    public ClubResponse toResponse(Club club, long memberCount, Double distanceKm) {
        return new ClubResponse(
            club.getId(),
            club.getName(),
            club.getDescription(),
            club.getLocation(),
            club.getLatitude(),
            club.getLongitude(),
            distanceKm,
            userMapper.toPublicSummary(club.getCreatedBy()),
            memberCount,
            club.getCreatedAt(),
            club.getUpdatedAt()
        );
    }
}
