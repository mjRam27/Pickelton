package com.pickelton.backend.match.service;

import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.mapper.MatchMapper;
import com.pickelton.backend.match.dto.CreateMatchRequest;
import com.pickelton.backend.match.dto.MatchResponse;
import com.pickelton.backend.match.dto.UpdateMatchScoreRequest;
import com.pickelton.backend.match.entity.Match;
import com.pickelton.backend.match.repository.MatchRepository;
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
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final MatchMapper matchMapper;

    public MatchResponse createMatch(CreateMatchRequest request) {
        Tournament tournament = tournamentRepository.findById(request.tournamentId())
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        User player1 = userRepository.findById(request.player1Id())
            .orElseThrow(() -> new ResourceNotFoundException("Player 1 not found"));
        User player2 = userRepository.findById(request.player2Id())
            .orElseThrow(() -> new ResourceNotFoundException("Player 2 not found"));

        if (player1.getId().equals(player2.getId())) {
            throw new BadRequestException("Players must be different");
        }

        Match match = Match.builder()
            .tournament(tournament)
            .player1(player1)
            .player2(player2)
            .round(request.round())
            .status(com.pickelton.backend.enums.MatchStatus.SCHEDULED)
            .score1(0)
            .score2(0)
            .build();

        return matchMapper.toResponse(matchRepository.save(match));
    }

    @Transactional(readOnly = true)
    public MatchResponse getMatch(UUID id) {
        return matchMapper.toResponse(matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found")));
    }

    public MatchResponse updateScore(UUID id, UpdateMatchScoreRequest request) {
        Match match = matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (request.score1().equals(request.score2())) {
            throw new BadRequestException("A match cannot end in a tie");
        }

        User winner = request.score1() > request.score2() ? match.getPlayer1() : match.getPlayer2();
        match.setScore1(request.score1());
        match.setScore2(request.score2());
        match.setWinner(winner);
        match.setStatus(com.pickelton.backend.enums.MatchStatus.COMPLETED);

        return matchMapper.toResponse(matchRepository.save(match));
    }
}