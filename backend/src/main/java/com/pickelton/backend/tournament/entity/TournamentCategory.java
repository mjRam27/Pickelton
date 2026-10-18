package com.pickelton.backend.tournament.entity;

import java.math.BigDecimal;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.TournamentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// One competition inside an event, e.g. "Men's doubles" or "Under-18 singles", with its own limit and fee.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tournament_categories")
public class TournamentCategory extends BaseEntity {

    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TournamentType format;

    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers;

    @Column(name = "entry_fee", precision = 12, scale = 2)
    private BigDecimal entryFee;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
