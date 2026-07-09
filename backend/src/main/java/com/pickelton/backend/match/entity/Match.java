package com.pickelton.backend.match.entity;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import com.pickelton.backend.club.entity.Club;
import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.MatchCategory;
import com.pickelton.backend.enums.MatchType;
import com.pickelton.backend.enums.MatchStatus;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import org.hibernate.type.SqlTypes;

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
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "sport_type")
    private SportType sport;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "match_type", nullable = false, columnDefinition = "match_type")
    private MatchType matchType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "match_category", nullable = false, length = 30)
    private MatchCategory matchCategory = MatchCategory.FRIENDLY;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @Column(length = 50)
    private String round;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "match_status")
    private MatchStatus status;

    @Column(name = "scheduled_at")
    private OffsetDateTime scheduledAt;

    @Column(length = 255)
    private String location;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> rules = new LinkedHashMap<>();
}
