package com.pickelton.backend.registration.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.PaymentStatus;
import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.tournament.entity.Tournament;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "registrations", uniqueConstraints = @UniqueConstraint(name = "uk_registration", columnNames = {"user_id", "tournament_id"}))
public class Registration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status;

    // Answers to the host's registration questions, keyed by question id.
    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, String> answers = new LinkedHashMap<>();

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.NOT_REQUIRED;

    // Entry fee at the time of registering, so later fee edits don't change what this player owes.
    @Column(precision = 12, scale = 2)
    private BigDecimal amountDue;

    // UPI transaction reference (UTR) the player gives after paying.
    private String paymentReference;

    private OffsetDateTime paymentSubmittedAt;

    private OffsetDateTime paymentReviewedAt;

    // Shown to the player when the host rejects a payment.
    private String hostNote;
}
