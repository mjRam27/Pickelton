package com.pickelton.backend.host.service;

import java.time.OffsetDateTime;
import java.util.Optional;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.HostVerificationStatus;
import com.pickelton.backend.host.dto.HostVerificationResponse;
import com.pickelton.backend.host.dto.SubmitHostVerificationRequest;
import com.pickelton.backend.host.entity.HostVerification;
import com.pickelton.backend.host.repository.HostVerificationRepository;
import com.pickelton.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class HostVerificationService {

    private final HostVerificationRepository hostVerificationRepository;
    private final CurrentUserService currentUserService;

    public HostVerificationResponse submitMine(SubmitHostVerificationRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        HostVerification verification = hostVerificationRepository.findByUserId(currentUser.getId())
            .orElseGet(() -> HostVerification.builder().user(currentUser).build());

        if (verification.getStatus() == HostVerificationStatus.APPROVED) {
            throw new BadRequestException("Host verification is already approved");
        }

        applyRequest(verification, request);
        verification.setStatus(HostVerificationStatus.PENDING_REVIEW);
        verification.setSubmittedAt(OffsetDateTime.now());
        verification.setReviewedAt(null);
        verification.setReviewedBy(null);
        verification.setRejectionReason(null);
        verification.setRiskScore(null);
        verification.setMetadataJson(null);

        return toResponse(hostVerificationRepository.save(verification));
    }

    @Transactional(readOnly = true)
    public Optional<HostVerificationResponse> getMine() {
        return hostVerificationRepository.findByUserId(currentUserService.getUserId())
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public boolean isApprovedHost(User user) {
        return hostVerificationRepository.existsByUserIdAndStatus(user.getId(), HostVerificationStatus.APPROVED);
    }

    private void applyRequest(HostVerification verification, SubmitHostVerificationRequest request) {
        verification.setLegalName(request.legalName());
        verification.setDateOfBirth(request.dateOfBirth());
        verification.setPhoneNumber(request.phoneNumber());
        verification.setCountryCode("IN");
        verification.setAddressLine1(request.addressLine1());
        verification.setAddressLine2(request.addressLine2());
        verification.setCity(request.city());
        verification.setStateRegion(request.stateRegion());
        verification.setPostalCode(request.postalCode());
        verification.setIdDocumentType(request.idDocumentType());
        verification.setIdDocumentCountry("IN");
        verification.setIdDocumentNumberLast4(request.idDocumentNumberLast4());
        verification.setDocumentImageUrl(request.documentImageUrl());
        verification.setSelfieWithDocumentUrl(request.selfieWithDocumentUrl());
        verification.setTermsAccepted(request.termsAccepted());
        verification.setDataProcessingConsent(request.dataProcessingConsent());
    }

    private HostVerificationResponse toResponse(HostVerification verification) {
        return new HostVerificationResponse(
            verification.getId(),
            verification.getUser().getId(),
            verification.getLegalName(),
            verification.getDateOfBirth(),
            verification.getPhoneNumber(),
            verification.getAddressLine1(),
            verification.getAddressLine2(),
            verification.getCity(),
            verification.getStateRegion(),
            verification.getPostalCode(),
            verification.getIdDocumentType(),
            verification.getIdDocumentNumberLast4(),
            verification.getDocumentImageUrl(),
            verification.getSelfieWithDocumentUrl(),
            verification.getStatus(),
            verification.getSubmittedAt(),
            verification.getReviewedAt(),
            verification.getRejectionReason(),
            verification.getCreatedAt(),
            verification.getUpdatedAt()
        );
    }
}
