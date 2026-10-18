package com.pickelton.backend.match.dto;

import java.util.List;

public record MatchTeamResponse(Integer teamNo, List<MatchTeamPlayerResponse> players) {
}
