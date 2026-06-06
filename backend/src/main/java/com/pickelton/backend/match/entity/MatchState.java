package com.pickelton.backend.match.entity;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.pickelton.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "match_state")
public class MatchState extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false, unique = true)
    private Match match;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "current_score", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> currentScore = new LinkedHashMap<>();

    @Builder.Default
    @Column(name = "current_set", nullable = false)
    private Integer currentSet = 1;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "set_summary", nullable = false, columnDefinition = "jsonb")
    private List<Map<String, Object>> setSummary = new ArrayList<>();

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "live_state", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> liveState = new LinkedHashMap<>();

    @Builder.Default
    @Column(nullable = false)
    private Long revision = 0L;

    @Column(name = "last_event_at", nullable = false)
    private OffsetDateTime lastEventAt;
}
