package com.pickelton.backend.analytics.entity;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.SportType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "club_stats", uniqueConstraints = @UniqueConstraint(name = "uk_club_stats_club_sport", columnNames = {"club_id", "sport_type"}))
public class ClubStats extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false, length = 50)
    private SportType sportType;

    @Builder.Default
    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer wins = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer losses = 0;

    @Builder.Default
    @Column(name = "club_rating", nullable = false)
    private Integer clubRating = 1000;

    @Builder.Default
    @Column(name = "active_players", nullable = false)
    private Integer activePlayers = 0;

    @Builder.Default
    @Column(name = "tournament_wins", nullable = false)
    private Integer tournamentWins = 0;
}
