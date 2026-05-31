package com.pickelton.backend.match.entity;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.MatchParticipantRole;
import com.pickelton.backend.enums.MatchParticipantStatus;
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
@Table(name = "match_participants",
    uniqueConstraints = @UniqueConstraint(name = "uk_match_participant_role", columnNames = {"match_id", "user_id", "role"}))
public class MatchParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "team_code", length = 10)
    private String teamCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MatchParticipantRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MatchParticipantStatus status;
}
