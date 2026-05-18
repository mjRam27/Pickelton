package com.pickelton.backend.host.dto;

import java.time.LocalDate;

import com.pickelton.backend.enums.IdDocumentType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SubmitHostVerificationRequest(
    @NotBlank @Size(max = 160) String legalName,
    @NotNull @Past LocalDate dateOfBirth,
    @NotBlank @Size(max = 32) String phoneNumber,
    @NotBlank @Size(max = 180) String addressLine1,
    @Size(max = 180) String addressLine2,
    @NotBlank @Size(max = 100) String city,
    @Size(max = 100) String stateRegion,
    @NotBlank @Size(max = 32) String postalCode,
    @NotNull IdDocumentType idDocumentType,
    @NotBlank @Pattern(regexp = "^[A-Za-z0-9]{4}$", message = "Use only the last 4 document characters") String idDocumentNumberLast4,
    @NotBlank @Size(max = 1000) String documentImageUrl,
    @NotBlank @Size(max = 1000) String selfieWithDocumentUrl,
    @AssertTrue(message = "Terms must be accepted") boolean termsAccepted,
    @AssertTrue(message = "Data processing consent is required") boolean dataProcessingConsent
) {
}
