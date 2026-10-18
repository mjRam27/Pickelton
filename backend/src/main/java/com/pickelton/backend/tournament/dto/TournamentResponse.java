package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentStatus;
import com.pickelton.backend.enums.TournamentType;
import com.pickelton.backend.user.dto.PublicUserSummary;

public record TournamentResponse(UUID id, String name, String description, SportType sportType,
                                 TournamentType tournamentType, TournamentStatus status, PublicUserSummary createdBy,
                                 UUID clubId, String clubName, BigDecimal entryFee, Integer maxPlayers,
                                 LocalDateTime startDate, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
