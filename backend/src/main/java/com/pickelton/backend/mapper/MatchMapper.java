package com.pickelton.backend.mapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.enums.ParticipantRole;
import com.pickelton.backend.match.dto.MatchParticipantResponse;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.match.entity.MatchState;
import org.springframework.stereotype.Component;

@Component
public class MatchMapper {

    public MatchResponse toResponse(Match match, UUID tournamentId, List<MatchParticipant> participants, MatchState state) {
        UUID player1Id = playerForTeam(participants, "A");
        UUID player2Id = playerForTeam(participants, "B");
        Map<String, Object> currentScore = state != null ? state.getCurrentScore() : Map.of("A", 0, "B", 0);
        return new MatchResponse(
            match.getId(),
            tournamentId,
            player1Id,
            player2Id,
            scoreForTeam(currentScore, "A"),
            scoreForTeam(currentScore, "B"),
            match.getWinner() != null ? match.getWinner().getId() : null,
            match.getRound(),
            match.getStatus(),
            match.getSport(),
            match.getMatchType(),
            match.getLocation(),
            match.getScheduledAt(),
            match.getRules(),
            participants.stream().map(this::toParticipantResponse).toList(),
            currentScore,
            state != null ? state.getCurrentSet() : 1,
            state != null ? state.getSetSummary() : List.of(),
            state != null ? state.getRevision() : 0L,
            match.getCreatedAt(),
            match.getUpdatedAt()
        );
    }

    private MatchParticipantResponse toParticipantResponse(MatchParticipant participant) {
        return new MatchParticipantResponse(
            participant.getId(),
            participant.getUser().getId(),
            participant.getUser().getName(),
            participant.getTeam(),
            participant.getRole(),
            participant.getInvitationStatus()
        );
    }

    private UUID playerForTeam(List<MatchParticipant> participants, String team) {
        return participants.stream()
            .filter(participant -> participant.getRole() == ParticipantRole.PLAYER)
            .filter(participant -> team.equalsIgnoreCase(participant.getTeam()))
            .map(participant -> participant.getUser().getId())
            .findFirst()
            .orElse(null);
    }

    private Integer scoreForTeam(Map<String, Object> score, String team) {
        Object value = score.get(team);
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            return Integer.parseInt(text);
        }
        return 0;
    }
}
