package com.pickelton.backend.team.controller;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.response.ApiResponse;
import com.pickelton.backend.enums.InvitationStatus;
import com.pickelton.backend.team.dto.CreateTeamRequest;
import com.pickelton.backend.team.dto.InviteTeamMemberRequest;
import com.pickelton.backend.team.dto.TeamInvitationResponse;
import com.pickelton.backend.team.dto.TeamResponse;
import com.pickelton.backend.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<ApiResponse<TeamResponse>> create(@Valid @RequestBody CreateTeamRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Team created", teamService.createTeam(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> mine() {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getMine()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getTeam(id)));
    }

    @PostMapping("/{id}/invitations")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> invite(
        @PathVariable UUID id, @Valid @RequestBody InviteTeamMemberRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Team invitation sent", teamService.invite(id, request)));
    }

    @GetMapping("/invitations/me")
    public ResponseEntity<ApiResponse<List<TeamInvitationResponse>>> invitations() {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getMyInvitations()));
    }

    @PatchMapping("/invitations/{id}")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> respond(@PathVariable UUID id, @RequestParam InvitationStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.respond(id, status), "Team invitation updated"));
    }
}
