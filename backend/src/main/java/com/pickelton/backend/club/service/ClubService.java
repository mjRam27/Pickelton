package com.pickelton.backend.club.service;

import com.pickelton.backend.club.dto.ClubMemberResponse;
import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.dto.CreateClubRequest;
import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.club.entity.ClubMember;
import com.pickelton.backend.club.repository.ClubMemberRepository;
import com.pickelton.backend.club.repository.ClubRepository;
import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.ClubRole;
import com.pickelton.backend.mapper.ClubMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final CurrentUserService currentUserService;
    private final ClubMapper clubMapper;

    public ClubResponse createClub(CreateClubRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        Club club = Club.builder()
            .name(request.name())
            .description(request.description())
            .location(request.location())
            .createdBy(currentUser)
            .build();

        Club savedClub = clubRepository.save(club);
        clubMemberRepository.save(ClubMember.builder()
            .club(savedClub)
            .user(currentUser)
            .role(ClubRole.ADMIN)
            .build());

        return clubMapper.toResponse(savedClub, 1L);
    }

    @Transactional(readOnly = true)
    public PageResponse<ClubResponse> getClubs(int page, int size) {
        var clubPage = clubRepository.findAll(PageRequest.of(page, size));
        var responses = clubPage.getContent().stream()
            .map(club -> clubMapper.toResponse(club, clubMemberRepository.countByClubId(club.getId())))
            .toList();
        return new PageResponse<>(responses, clubPage.getNumber(), clubPage.getSize(), clubPage.getTotalElements(), clubPage.getTotalPages(), clubPage.isLast());
    }

    @Transactional(readOnly = true)
    public ClubResponse getClub(UUID id) {
        Club club = clubRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        return clubMapper.toResponse(club, clubMemberRepository.countByClubId(id));
    }

    public ClubMemberResponse joinClub(UUID clubId) {
        var currentUser = currentUserService.getCurrentUser();
        Club club = clubRepository.findById(clubId)
            .orElseThrow(() -> new ResourceNotFoundException("Club not found"));

        if (clubMemberRepository.existsByClubIdAndUserId(clubId, currentUser.getId())) {
            throw new BadRequestException("User is already a club member");
        }

        ClubMember membership = clubMemberRepository.save(ClubMember.builder()
            .club(club)
            .user(currentUser)
            .role(ClubRole.MEMBER)
            .build());

        return new ClubMemberResponse(membership.getId(), clubId, currentUser.getId(), membership.getRole());
    }
}