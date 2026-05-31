package com.pickelton.backend.mapper;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.match.dto.MatchParticipantResponse;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.MatchParticipant;
import com.pickelton.backend.match.entity.MatchState;
import org.springframework.stereotype.Component;

@Component
public class MatchMapper {

    public MatchResponse toResponse(Match match, UUID tournamentId, List<MatchParticipant> participants, MatchState state) {
        List<MatchParticipantResponse> participantResponses = participants.stream()
            .map(participant -> new MatchParticipantResponse(
                participant.getUser().getId(), participant.getTeamCode(), participant.getRole(), participant.getStatus()))
            .toList();
        UUID player1Id = playerForTeam(participants, "A");
        UUID player2Id = playerForTeam(participants, "B");
        return new MatchResponse(
            match.getId(),
            tournamentId,
            player1Id,
            player2Id,
            state.getScores().getOrDefault("A", 0),
            state.getScores().getOrDefault("B", 0),
            match.getWinner() != null ? match.getWinner().getId() : null,
            match.getRound(),
            match.getStatus(),
            participantResponses,
            match.getRules(),
            match.getVenue(),
            match.getScheduledAt(),
            state.getSets(),
            state.getRevision(),
            match.getCreatedAt(),
            match.getUpdatedAt()
        );
    }

    private UUID playerForTeam(List<MatchParticipant> participants, String teamCode) {
        return participants.stream()
            .filter(participant -> participant.getRole() == MatchParticipantRole.PLAYER)
            .filter(participant -> teamCode.equals(participant.getTeamCode()))
            .map(participant -> participant.getUser().getId())
            .findFirst()
            .orElse(null);
    }
}
