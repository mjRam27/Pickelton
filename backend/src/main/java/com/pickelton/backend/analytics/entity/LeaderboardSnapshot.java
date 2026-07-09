package com.pickelton.backend.analytics.entity;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.LeaderboardScopeType;
import com.pickelton.backend.enums.LeaderboardType;
import com.pickelton.backend.enums.SportType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "leaderboard_snapshots")
public class LeaderboardSnapshot extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "leaderboard_type", nullable = false, length = 30)
    private LeaderboardType leaderboardType;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false, length = 50)
    private SportType sportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false, length = 30)
    private LeaderboardScopeType scopeType;

    @Column(name = "scope_id")
    private UUID scopeId;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<Map<String, Object>> rankings = new ArrayList<>();

    @Builder.Default
    @Column(name = "generated_at", nullable = false)
    private OffsetDateTime generatedAt = OffsetDateTime.now();
}
