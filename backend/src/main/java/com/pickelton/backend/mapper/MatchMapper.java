package com.pickelton.backend.mapper;

import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.MatchTeamPlayerResponse;
import com.pickelton.backend.match.dto.MatchTeamResponse;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchTeam;
import com.pickelton.backend.match.entity.MatchTeamPlayer;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MatchMapper {

    public MatchResponse toResponse(Match match) {
        List<MatchTeamResponse> teams = match.getTeams() == null ? List.of()
            : match.getTeams().stream()
                .sorted(Comparator.comparing(MatchTeam::getTeamNo))
                .map(team -> new MatchTeamResponse(
                    team.getTeamNo(),
                    team.getPlayers() == null ? List.of()
                        : team.getPlayers().stream()
                            .sorted(Comparator.comparing(MatchTeamPlayer::getSlotNo))
                            .map(player -> new MatchTeamPlayerResponse(
                                player.getUser().getId(),
                                player.getUser().getName(),
                                player.getSlotNo()
                            ))
                            .toList()
                ))
                .toList();

        return new MatchResponse(
            match.getId(),
            match.getTournament() != null ? match.getTournament().getId() : null,
            match.getMode(),
            match.getGameType(),
            match.getPointsToWin(),
            match.getBestOf(),
            match.getWinByTwo(),
            match.getScorekeeper() != null ? match.getScorekeeper().getId() : null,
            match.getScore1(),
            match.getScore2(),
            match.getWinner() != null ? match.getWinner().getId() : null,
            match.getRound(),
            match.getStatus(),
            teams,
            match.getCreatedAt(),
            match.getUpdatedAt()
        );
    }
}
