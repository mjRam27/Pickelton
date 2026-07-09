package com.pickelton.backend.host.service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.response.PageResponse;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.HostVerificationStatus;
import com.pickelton.backend.enums.PlatformRole;
import com.pickelton.backend.host.dto.HostVerificationResponse;
import com.pickelton.backend.host.dto.ReviewHostVerificationRequest;
import com.pickelton.backend.host.dto.SubmitHostVerificationRequest;
import com.pickelton.backend.host.entity.HostVerification;
import com.pickelton.backend.host.repository.HostVerificationRepository;
import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class HostVerificationService {

    private final HostVerificationRepository hostVerificationRepository;
    private final CurrentUserService currentUserService;
    private final UserService userService;

    public HostVerificationResponse submitMine(SubmitHostVerificationRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        if (!currentUser.isPhoneVerified()) {
            throw new BadRequestException("Verify your phone number before submitting host verification");
        }
        if (!currentUser.getPhoneNumber().equals(request.phoneNumber())) {
            throw new BadRequestException("Host verification phone number must match your verified account phone number");
        }
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
        return user.getRole() == PlatformRole.HOST
            || user.getRole() == PlatformRole.ADMIN
            || hostVerificationRepository.existsByUserIdAndStatus(user.getId(), HostVerificationStatus.APPROVED);
    }

    @Transactional(readOnly = true)
    public PageResponse<HostVerificationResponse> getPending(int page, int size) {
        var result = hostVerificationRepository.findByStatusOrderBySubmittedAtAsc(
            HostVerificationStatus.PENDING_REVIEW,
            PageRequest.of(page, size)
        );
        return new PageResponse<>(
            result.getContent().stream().map(this::toResponse).toList(),
            result.getNumber(),
            result.getSize(),
            result.getTotalElements(),
            result.getTotalPages(),
            result.isLast()
        );
    }

    public HostVerificationResponse review(UUID id, ReviewHostVerificationRequest request) {
        HostVerification verification = hostVerificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Host verification not found"));
        User reviewer = currentUserService.getCurrentUser();

        verification.setStatus(request.status());
        verification.setReviewedAt(OffsetDateTime.now());
        verification.setReviewedBy(reviewer);
        verification.setRejectionReason(request.status() == HostVerificationStatus.REJECTED ? request.rejectionReason() : null);
        verification.setRiskScore(request.riskScore());
        verification.setMetadataJson(request.metadataJson());

        User applicant = verification.getUser();
        if (request.status() == HostVerificationStatus.APPROVED && applicant.getRole() == PlatformRole.USER) {
            applicant.setRole(PlatformRole.HOST);
            userService.save(applicant);
        }

        return toResponse(hostVerificationRepository.save(verification));
    }

    private void applyRequest(HostVerification verification, SubmitHostVerificationRequest request) {
        verification.setFullName(request.fullName());
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
            verification.getFullName(),
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
