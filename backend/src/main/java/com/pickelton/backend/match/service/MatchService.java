package com.pickelton.backend.match.service;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.config.ScoreBroadcastService;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.UpdateMatchScoreRequest;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.entity.ScoreHistory;
import com.pickelton.backend.match.repository.MatchRepository;
import com.pickelton.backend.match.repository.ScoreHistoryRepository;
import com.pickelton.backend.registration.repository.RegistrationRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final ScoreHistoryRepository scoreHistoryRepository;
    private final TournamentRepository tournamentRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final ScoreBroadcastService scoreBroadcastService;
    private final MatchMapper matchMapper;

    public MatchResponse createMatch(CreateMatchRequest request) {
        Tournament tournament = requireTournament(request.tournamentId());
        requireOrganizer(tournament);
        if (tournament.getStatus() == TournamentStatus.FINISHED || tournament.getStatus() == TournamentStatus.CANCELLED) {
            throw new BadRequestException("Matches cannot be created for a closed tournament");
        }
        User player1 = requireRegisteredPlayer(tournament.getId(), request.player1Id(), "Player 1");
        User player2 = requireRegisteredPlayer(tournament.getId(), request.player2Id(), "Player 2");
        if (player1.getId().equals(player2.getId())) {
            throw new BadRequestException("Players must be different");
        }
        Match match = Match.builder()
            .tournament(tournament)
            .player1(player1)
            .player2(player2)
            .round(request.round().trim())
            .status(MatchStatus.SCHEDULED)
            .score1(0)
            .score2(0)
            .build();
        return matchMapper.toResponse(matchRepository.save(match));
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatch(UUID id) {
        return matchMapper.toResponse(requireMatch(id));
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getTournamentMatches(UUID tournamentId) {
        requireTournament(tournamentId);
        return matchRepository.findByTournamentIdOrderByCreatedAtAsc(tournamentId).stream()
            .map(matchMapper::toResponse).toList();
    }

    public MatchResponse updateScore(UUID id, UpdateMatchScoreRequest request) {
        Match match = requireMatch(id);
        requireOrganizer(match.getTournament());
        if (match.getTournament().getStatus() != TournamentStatus.ONGOING) {
            throw new BadRequestException("Scores can only be recorded while the tournament is ongoing");
        }
        if (match.getStatus() == MatchStatus.CANCELLED) {
            throw new BadRequestException("Cancelled match cannot be scored");
        }
        if (request.score1().equals(request.score2())) {
            throw new BadRequestException("A match cannot end in a tie");
        }
        User updater = currentUserService.getCurrentUser();
        scoreHistoryRepository.save(ScoreHistory.builder().match(match).player(match.getPlayer1())
            .oldScore(match.getScore1()).newScore(request.score1()).updatedBy(updater).build());
        scoreHistoryRepository.save(ScoreHistory.builder().match(match).player(match.getPlayer2())
            .oldScore(match.getScore2()).newScore(request.score2()).updatedBy(updater).build());
        match.setScore1(request.score1());
        match.setScore2(request.score2());
        match.setWinner(request.score1() > request.score2() ? match.getPlayer1() : match.getPlayer2());
        match.setStatus(MatchStatus.COMPLETED);
        Match saved = matchRepository.saveAndFlush(match);
        scoreBroadcastService.broadcastScoreUpdate(saved.getId(), new ScoreBroadcastService.ScoreUpdatePayload(
            saved.getId(), saved.getScore1(), saved.getScore2(), saved.getStatus(), saved.getUpdatedAt()));
        return matchMapper.toResponse(saved);
    }

    public MatchResponse cancelMatch(UUID id) {
        Match match = requireMatch(id);
        requireOrganizer(match.getTournament());
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new BadRequestException("Completed match cannot be cancelled");
        }
        match.setStatus(MatchStatus.CANCELLED);
        return matchMapper.toResponse(matchRepository.save(match));
    }

    private User requireRegisteredPlayer(UUID tournamentId, UUID userId, String label) {
        if (!registrationRepository.existsByTournamentIdAndUserIdAndStatus(tournamentId, userId, RegistrationStatus.REGISTERED)) {
            throw new BadRequestException(label + " must be registered in the tournament");
        }
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException(label + " not found"));
    }

    private Tournament requireTournament(UUID id) {
        return tournamentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private Match requireMatch(UUID id) {
        return matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
    }

    private void requireOrganizer(Tournament tournament) {
        if (!tournament.getCreatedBy().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the tournament host can manage matches");
        }
    }
}
