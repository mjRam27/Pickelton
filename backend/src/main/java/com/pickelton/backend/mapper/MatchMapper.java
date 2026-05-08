package com.pickelton.backend.mapper;

import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.entity.Match;
import org.springframework.stereotype.Component;

@Component
public class MatchMapper {

    public MatchResponse toResponse(Match match) {
        return new MatchResponse(
            match.getId(),
            match.getTournament().getId(),
            match.getPlayer1().getId(),
            match.getPlayer2().getId(),
            match.getScore1(),
            match.getScore2(),
            match.getWinner() != null ? match.getWinner().getId() : null,
            match.getRound(),
            match.getStatus(),
            match.getCreatedAt(),
            match.getUpdatedAt()
        );
    }
}