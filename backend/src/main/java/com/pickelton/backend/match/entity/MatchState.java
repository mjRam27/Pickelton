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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scores", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Integer> scores = new LinkedHashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sets", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private List<Map<String, Integer>> sets = new ArrayList<>();

    @Column(nullable = false)
    private Long revision;

    @Column(name = "last_event_at", nullable = false)
    private OffsetDateTime lastEventAt;
}
