package com.pickelton.backend.tournament.service;

import java.util.UUID;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.club.repository.ClubRepository;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.mapper.TournamentMapper;
import com.pickelton.backend.tournament.dto.CreateTournamentRequest;
import com.pickelton.backend.tournament.dto.TournamentResponse;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final ClubRepository clubRepository;
    private final CurrentUserService currentUserService;
    private final TournamentMapper tournamentMapper;

    public TournamentResponse createTournament(CreateTournamentRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        Club club = null;
        if (request.clubId() != null) {
            club = clubRepository.findById(request.clubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        }

        Tournament tournament = Tournament.builder()
            .name(request.name())
            .description(request.description())
            .sportType(request.sportType())
            .tournamentType(request.tournamentType())
            .status(com.pickelton.backend.enums.TournamentStatus.UPCOMING)
            .createdBy(currentUser)
            .club(club)
            .entryFee(request.entryFee())
            .maxPlayers(request.maxPlayers())
            .startDate(request.startDate())
            .build();

        return tournamentMapper.toResponse(tournamentRepository.save(tournament));
    }

    @Transactional(readOnly = true)
    public PageResponse<TournamentResponse> getTournaments(int page, int size) {
        var tournamentPage = tournamentRepository.findAll(PageRequest.of(page, size));
        return new PageResponse<>(
            tournamentPage.getContent().stream().map(tournamentMapper::toResponse).toList(),
            tournamentPage.getNumber(),
            tournamentPage.getSize(),
            tournamentPage.getTotalElements(),
            tournamentPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public TournamentResponse getTournament(UUID id) {
        return tournamentMapper.toResponse(tournamentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found")));
    }
}