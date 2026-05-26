package com.pickelton.backend.match.entity;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.GameType;
import com.pickelton.backend.enums.MatchMode;
import com.pickelton.backend.enums.MatchStatus;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
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
@Table(name = "matches")
public class Match extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player1_id", nullable = false)
    private User player1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player2_id", nullable = false)
    private User player2;

    @Column(nullable = false)
    private Integer score1;

    @Column(nullable = false)
    private Integer score2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scorekeeper_id")
    private User scorekeeper;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchMode mode;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false)
    private GameType gameType;

    @Column(name = "points_to_win", nullable = false)
    private Integer pointsToWin;

    @Column(name = "best_of", nullable = false)
    private Integer bestOf;

    @Column(name = "win_by_two", nullable = false)
    private Boolean winByTwo;

    @Column(nullable = false)
    private String round;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "match", orphanRemoval = true)
    private List<MatchTeam> teams = new ArrayList<>();
}
