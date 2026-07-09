package com.pickelton.backend.club.service;

import java.util.List;
import java.util.UUID;
import java.time.OffsetDateTime;

import com.pickelton.backend.club.dto.ClubMemberResponse;
import com.pickelton.backend.club.dto.ClubInvitationResponse;
import com.pickelton.backend.club.dto.ClubResponse;
import com.pickelton.backend.club.dto.CreateClubRequest;
import com.pickelton.backend.club.dto.InviteClubMemberRequest;
import com.pickelton.backend.club.dto.UpdateClubMemberRoleRequest;
import com.pickelton.backend.club.dto.UpdateClubRequest;
import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.club.entity.ClubInvitation;
import com.pickelton.backend.club.entity.ClubMember;
import com.pickelton.backend.club.repository.ClubInvitationRepository;
import com.pickelton.backend.club.repository.ClubMemberRepository;
import com.pickelton.backend.club.repository.ClubRepository;
import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.ClubRole;
import com.pickelton.backend.enums.ClubStatus;
import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.PlatformRole;
import com.pickelton.backend.mapper.ClubMapper;
import com.pickelton.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ClubService {

    private static final int MAX_OWNED_CLUBS_PER_USER = 4;

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubInvitationRepository clubInvitationRepository;
    private final com.pickelton.backend.user.repository.UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final ClubMapper clubMapper;
    private final UserMapper userMapper;

    public ClubResponse createClub(CreateClubRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != PlatformRole.ADMIN && !currentUser.isPhoneVerified()) {
            throw new BadRequestException("Verify your phone number before creating a club");
        }
        if (currentUser.getRole() != PlatformRole.ADMIN
            && clubRepository.countByOwnerIdAndStatus(currentUser.getId(), ClubStatus.ACTIVE) >= MAX_OWNED_CLUBS_PER_USER) {
            throw new BadRequestException("You can create up to 4 active clubs");
        }
        Club club = Club.builder()
            .name(request.name().trim())
            .description(request.description())
            .location(request.location().trim())
            .createdBy(currentUser)
            .owner(currentUser)
            .status(ClubStatus.ACTIVE)
            .build();

        Club savedClub = clubRepository.save(club);
        clubMemberRepository.save(ClubMember.builder()
            .club(savedClub)
            .user(currentUser)
            .role(ClubRole.OWNER)
            .build());
        return clubMapper.toResponse(savedClub, 1L);
    }

    @Transactional(readOnly = true)
    public PageResponse<ClubResponse> getClubs(String search, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var clubPage = search == null || search.isBlank()
            ? clubRepository.findAll(pageable)
            : clubRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(search.trim(), search.trim(), pageable);
        var responses = clubPage.getContent().stream()
            .map(club -> clubMapper.toResponse(club, clubMemberRepository.countByClubId(club.getId())))
            .toList();
        return new PageResponse<>(responses, clubPage.getNumber(), clubPage.getSize(), clubPage.getTotalElements(), clubPage.getTotalPages(), clubPage.isLast());
    }

    @Transactional(readOnly = true)
    public ClubResponse getClub(UUID id) {
        Club club = requireClub(id);
        return clubMapper.toResponse(club, clubMemberRepository.countByClubId(id));
    }

    public ClubMemberResponse joinClub(UUID clubId) {
        var currentUser = currentUserService.getCurrentUser();
        Club club = requireClub(clubId);
        if (clubMemberRepository.existsByClubIdAndUserId(clubId, currentUser.getId())) {
            throw new BadRequestException("User is already a club member");
        }
        ClubMember membership = clubMemberRepository.save(ClubMember.builder()
            .club(club)
            .user(currentUser)
            .role(ClubRole.MEMBER)
            .build());
        return toMemberResponse(membership);
    }

    public ClubInvitationResponse inviteMember(UUID clubId, InviteClubMemberRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        Club club = requireClub(clubId);
        requireAdmin(clubId);
        var invitedUser = userRepository.findById(request.userId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (clubMemberRepository.existsByClubIdAndUserId(clubId, invitedUser.getId())) {
            throw new BadRequestException("User is already a club member");
        }
        if (clubInvitationRepository.existsByClubIdAndInvitedUserIdAndStatus(clubId, invitedUser.getId(), InvitationStatus.INVITED)) {
            throw new BadRequestException("User already has a pending club invitation");
        }
        ClubInvitation invitation = clubInvitationRepository.save(ClubInvitation.builder()
            .club(club)
            .invitedUser(invitedUser)
            .invitedBy(currentUser)
            .build());
        return toInvitationResponse(invitation);
    }

    public ClubInvitationResponse respondInvitation(UUID invitationId, InvitationStatus status) {
        if (status != InvitationStatus.ACCEPTED && status != InvitationStatus.DECLINED) {
            throw new BadRequestException("Invitation can only be accepted or declined");
        }
        ClubInvitation invitation = clubInvitationRepository.findByIdAndInvitedUserId(invitationId, currentUserService.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Club invitation not found"));
        if (invitation.getStatus() != InvitationStatus.INVITED) {
            throw new BadRequestException("Invitation has already been answered");
        }
        invitation.setStatus(status);
        invitation.setRespondedAt(OffsetDateTime.now());
        if (status == InvitationStatus.ACCEPTED
            && !clubMemberRepository.existsByClubIdAndUserId(invitation.getClub().getId(), invitation.getInvitedUser().getId())) {
            clubMemberRepository.save(ClubMember.builder()
                .club(invitation.getClub())
                .user(invitation.getInvitedUser())
                .role(ClubRole.MEMBER)
                .build());
        }
        return toInvitationResponse(clubInvitationRepository.save(invitation));
    }

    @Transactional(readOnly = true)
    public List<ClubInvitationResponse> getMyInvitations() {
        return clubInvitationRepository.findByInvitedUserIdOrderByCreatedAtDesc(currentUserService.getUserId()).stream()
            .map(this::toInvitationResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ClubResponse> getMyClubs() {
        return clubMemberRepository.findByUserId(currentUserService.getUserId()).stream()
            .map(member -> clubMapper.toResponse(member.getClub(), clubMemberRepository.countByClubId(member.getClub().getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ClubMemberResponse> getMembers(UUID clubId) {
        requireClub(clubId);
        return clubMemberRepository.findByClubId(clubId).stream().map(this::toMemberResponse).toList();
    }

    public ClubResponse updateClub(UUID clubId, UpdateClubRequest request) {
        Club club = requireClub(clubId);
        requireAdmin(clubId);
        if (request.name() != null && !request.name().isBlank()) {
            club.setName(request.name().trim());
        }
        if (request.description() != null) {
            club.setDescription(request.description().trim());
        }
        if (request.location() != null && !request.location().isBlank()) {
            club.setLocation(request.location().trim());
        }
        if (request.city() != null) {
            club.setCity(request.city().trim());
        }
        if (request.logoUrl() != null) {
            club.setLogoUrl(request.logoUrl().trim());
        }
        return clubMapper.toResponse(clubRepository.save(club), clubMemberRepository.countByClubId(clubId));
    }

    public ClubResponse updateLogo(UUID clubId, String logoUrl) {
        Club club = requireClub(clubId);
        requireAdmin(clubId);
        club.setLogoUrl(logoUrl);
        return clubMapper.toResponse(clubRepository.save(club), clubMemberRepository.countByClubId(clubId));
    }

    public void leaveClub(UUID clubId) {
        Club club = requireClub(clubId);
        var user = currentUserService.getCurrentUser();
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId())
            .orElseThrow(() -> new BadRequestException("You are not a member of this club"));
        if (club.getOwner() != null && club.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Club owner must transfer ownership before leaving the club");
        }
        if (member.getRole() == ClubRole.ADMIN && clubMemberRepository.countByClubIdAndRole(clubId, ClubRole.ADMIN) <= 1) {
            throw new BadRequestException("Assign another admin before leaving the club");
        }
        clubMemberRepository.delete(member);
    }

    public ClubMemberResponse updateMemberRole(UUID clubId, UUID userId, UpdateClubMemberRoleRequest request) {
        Club club = requireClub(clubId);
        requireAdmin(clubId);
        if (request.role() == ClubRole.OWNER) {
            throw new BadRequestException("Use ownership transfer to assign a new owner");
        }
        if (club.getOwner() != null && club.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Club owner role cannot be changed");
        }
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Club member not found"));
        if (member.getRole() == ClubRole.OWNER) {
            throw new BadRequestException("Club owner role cannot be changed");
        }
        member.setRole(request.role());
        return toMemberResponse(clubMemberRepository.save(member));
    }

    public void removeMember(UUID clubId, UUID userId) {
        Club club = requireClub(clubId);
        requireAdmin(clubId);
        if (club.getOwner() != null && club.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Club owner cannot be removed");
        }
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Club member not found"));
        clubMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public boolean isClubAdmin(UUID clubId, UUID userId) {
        var currentUser = currentUserService.getCurrentUser();
        return currentUser.getRole() == PlatformRole.ADMIN && currentUser.getId().equals(userId)
            || clubMemberRepository.existsByClubIdAndUserIdAndRoleIn(clubId, userId, List.of(ClubRole.OWNER, ClubRole.ADMIN));
    }

    private Club requireClub(UUID clubId) {
        return clubRepository.findById(clubId)
            .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
    }

    private void requireAdmin(UUID clubId) {
        if (!isClubAdmin(clubId, currentUserService.getUserId())) {
            throw new ForbiddenException("Club admin permission is required");
        }
    }

    private ClubMemberResponse toMemberResponse(ClubMember member) {
        return new ClubMemberResponse(
            member.getId(),
            member.getClub().getId(),
            userMapper.toPublicSummary(member.getUser()),
            member.getRole(),
            member.getCreatedAt()
        );
    }

    private ClubInvitationResponse toInvitationResponse(ClubInvitation invitation) {
        return new ClubInvitationResponse(
            invitation.getId(),
            invitation.getClub().getId(),
            invitation.getClub().getName(),
            userMapper.toPublicSummary(invitation.getInvitedUser()),
            userMapper.toPublicSummary(invitation.getInvitedBy()),
            invitation.getStatus(),
            invitation.getCreatedAt()
        );
    }
}
