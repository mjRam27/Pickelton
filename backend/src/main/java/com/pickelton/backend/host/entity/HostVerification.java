package com.pickelton.backend.host.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.HostVerificationStatus;
import com.pickelton.backend.enums.IdDocumentType;
import com.pickelton.backend.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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
@Table(name = "host_applications")
public class HostVerification extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "phone_number", nullable = false, length = 32)
    private String phoneNumber;

    @Column(name = "country_code", nullable = false, length = 2)
    @Builder.Default
    private String countryCode = "IN";

    @Column(name = "address_line1", nullable = false, length = 180)
    private String addressLine1;

    @Column(name = "address_line2", length = 180)
    private String addressLine2;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "state_region", length = 100)
    private String stateRegion;

    @Column(name = "postal_code", nullable = false, length = 32)
    private String postalCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "id_document_type", nullable = false, length = 40)
    private IdDocumentType idDocumentType;

    @Column(name = "id_document_country", nullable = false, length = 2)
    @Builder.Default
    private String idDocumentCountry = "IN";

    @Column(name = "id_document_number_last4", nullable = false, length = 4)
    private String idDocumentNumberLast4;

    @Column(name = "document_image_url", nullable = false, length = 1000)
    private String documentImageUrl;

    @Column(name = "selfie_with_document_url", nullable = false, length = 1000)
    private String selfieWithDocumentUrl;

    @Column(name = "terms_accepted", nullable = false)
    private boolean termsAccepted;

    @Column(name = "data_processing_consent", nullable = false)
    private boolean dataProcessingConsent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private HostVerificationStatus status;

    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    @Column(name = "risk_score", precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(name = "metadata_json", columnDefinition = "text")
    private String metadataJson;
}
