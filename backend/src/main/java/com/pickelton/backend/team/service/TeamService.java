package com.pickelton.backend.team.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.enums.TeamRole;
import com.pickelton.backend.mapper.UserMapper;
import com.pickelton.backend.team.dto.CreateTeamRequest;
import com.pickelton.backend.team.dto.InviteTeamMemberRequest;
import com.pickelton.backend.team.dto.TeamInvitationResponse;
import com.pickelton.backend.team.dto.TeamMemberResponse;
import com.pickelton.backend.team.dto.TeamResponse;
import com.pickelton.backend.team.entity.Team;
import com.pickelton.backend.team.entity.TeamInvitation;
import com.pickelton.backend.team.entity.TeamMember;
import com.pickelton.backend.team.repository.TeamInvitationRepository;
import com.pickelton.backend.team.repository.TeamMemberRepository;
import com.pickelton.backend.team.repository.TeamRepository;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final UserMapper userMapper;

    public TeamResponse createTeam(CreateTeamRequest request) {
        var currentUser = currentUserService.getCurrentUser();
        Team team = teamRepository.save(Team.builder()
            .captain(currentUser)
            .name(request.name().trim())
            .sportType(request.sportType())
            .build());
        teamMemberRepository.save(TeamMember.builder()
            .team(team)
            .user(currentUser)
            .role(TeamRole.CAPTAIN)
            .build());
        return toResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getMine() {
        return teamMemberRepository.findByUserIdOrderByCreatedAtDesc(currentUserService.getUserId()).stream()
            .map(member -> toResponse(member.getTeam()))
            .toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeam(UUID id) {
        return toResponse(requireTeam(id));
    }

    public TeamInvitationResponse invite(UUID teamId, InviteTeamMemberRequest request) {
        Team team = requireTeam(teamId);
        requireCaptain(team);
        var invitedUser = userRepository.findById(request.userId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, invitedUser.getId())) {
            throw new BadRequestException("User is already on this team");
        }
        if (teamInvitationRepository.existsByTeamIdAndInvitedUserIdAndStatus(teamId, invitedUser.getId(), InvitationStatus.INVITED)) {
            throw new BadRequestException("User already has a pending invitation");
        }
        TeamInvitation invitation = teamInvitationRepository.save(TeamInvitation.builder()
            .team(team)
            .invitedUser(invitedUser)
            .invitedBy(currentUserService.getCurrentUser())
            .build());
        return toInvitationResponse(invitation);
    }

    public TeamInvitationResponse respond(UUID invitationId, InvitationStatus status) {
        if (status != InvitationStatus.ACCEPTED && status != InvitationStatus.DECLINED) {
            throw new BadRequestException("Invitation can only be accepted or declined");
        }
        TeamInvitation invitation = teamInvitationRepository.findByIdAndInvitedUserId(invitationId, currentUserService.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        if (invitation.getStatus() != InvitationStatus.INVITED) {
            throw new BadRequestException("Invitation has already been answered");
        }
        invitation.setStatus(status);
        invitation.setRespondedAt(OffsetDateTime.now());
        if (status == InvitationStatus.ACCEPTED) {
            teamMemberRepository.save(TeamMember.builder()
                .team(invitation.getTeam())
                .user(invitation.getInvitedUser())
                .role(TeamRole.MEMBER)
                .build());
        }
        return toInvitationResponse(teamInvitationRepository.save(invitation));
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationResponse> getMyInvitations() {
        return teamInvitationRepository.findByInvitedUserIdOrderByCreatedAtDesc(currentUserService.getUserId()).stream()
            .map(this::toInvitationResponse)
            .toList();
    }

    private Team requireTeam(UUID id) {
        return teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private void requireCaptain(Team team) {
        if (!team.getCaptain().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("Only the team captain can manage invitations");
        }
    }

    private TeamResponse toResponse(Team team) {
        List<TeamMemberResponse> members = teamMemberRepository.findByTeamId(team.getId()).stream()
            .map(this::toMemberResponse)
            .toList();
        return new TeamResponse(
            team.getId(),
            team.getName(),
            team.getSportType(),
            team.getStatus(),
            userMapper.toPublicSummary(team.getCaptain()),
            members,
            team.getCreatedAt()
        );
    }

    private TeamMemberResponse toMemberResponse(TeamMember member) {
        return new TeamMemberResponse(
            member.getId(),
            member.getTeam().getId(),
            userMapper.toPublicSummary(member.getUser()),
            member.getRole(),
            member.getStatus(),
            member.getJoinedAt()
        );
    }

    private TeamInvitationResponse toInvitationResponse(TeamInvitation invitation) {
        return new TeamInvitationResponse(
            invitation.getId(),
            invitation.getTeam().getId(),
            invitation.getTeam().getName(),
            userMapper.toPublicSummary(invitation.getInvitedUser()),
            userMapper.toPublicSummary(invitation.getInvitedBy()),
            invitation.getStatus(),
            invitation.getCreatedAt()
        );
    }
}
