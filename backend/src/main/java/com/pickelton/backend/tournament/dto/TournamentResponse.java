package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.enums.TournamentType;
import com.pickelton.backend.user.dto.UserResponse;

public record TournamentResponse(UUID id, String name, String description, SportType sportType,
                                 TournamentType tournamentType, TournamentStatus status, UserResponse createdBy,
                                 UUID clubId, String clubName, BigDecimal entryFee, Integer maxPlayers,
                                 LocalDateTime startDate, LocalDateTime createdAt, LocalDateTime updatedAt) {
}