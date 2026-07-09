package com.pickelton.backend.mapper;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.tournament.dto.TournamentResponse;
import com.pickelton.backend.tournament.entity.Tournament;
import org.springframework.stereotype.Component;

@Component
public class TournamentMapper {

    private final UserMapper userMapper;

    public TournamentMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public TournamentResponse toResponse(Tournament tournament) {
        Club club = tournament.getClub();
        return new TournamentResponse(
            tournament.getId(),
            tournament.getName(),
            tournament.getDescription(),
            tournament.getSportType(),
            tournament.getTournamentType(),
            tournament.getStatus(),
            userMapper.toPublicSummary(tournament.getCreatedBy()),
            club != null ? club.getId() : null,
            club != null ? club.getName() : null,
            tournament.getEntryFee(),
            tournament.getMaxPlayers(),
            tournament.getStartDate(),
            tournament.getBannerUrl(),
            tournament.getCreatedAt(),
            tournament.getUpdatedAt()
        );
    }
}
