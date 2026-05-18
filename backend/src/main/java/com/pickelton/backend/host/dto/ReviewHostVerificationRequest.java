package com.pickelton.backend.host.dto;

import java.math.BigDecimal;

import com.pickelton.backend.enums.HostVerificationStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewHostVerificationRequest(
    @NotNull HostVerificationStatus status,
    @Size(max = 2000) String rejectionReason,
    @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal riskScore,
    @Size(max = 8000) String metadataJson
) {

    @AssertTrue(message = "Review status must be APPROVED or REJECTED")
    public boolean isReviewStatus() {
        return status == HostVerificationStatus.APPROVED || status == HostVerificationStatus.REJECTED;
    }

    @AssertTrue(message = "Rejection reason is required when rejecting verification")
    public boolean isRejectionReasonValid() {
        return status != HostVerificationStatus.REJECTED
            || (rejectionReason != null && !rejectionReason.isBlank());
    }
}
