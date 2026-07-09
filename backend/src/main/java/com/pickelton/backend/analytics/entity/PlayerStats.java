package com.pickelton.backend.analytics.entity;

import java.time.OffsetDateTime;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.user.entity.User;
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
@Table(name = "player_stats", uniqueConstraints = @UniqueConstraint(name = "uk_player_stats_user_sport", columnNames = {"user_id", "sport_type"}))
public class PlayerStats extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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
    @Column(nullable = false)
    private Integer rating = 1000;

    @Builder.Default
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_match_at")
    private OffsetDateTime lastMatchAt;
}
