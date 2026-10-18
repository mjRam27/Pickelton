package com.pickelton.backend.mapper;

import java.util.Comparator;
import java.util.List;

import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.registration.dto.HostRegistrationResponse;
import com.pickelton.backend.registration.dto.RegistrationResponse;
import com.pickelton.backend.registration.dto.TournamentParticipantResponse;
import com.pickelton.backend.registration.entity.Registration;
import com.pickelton.backend.tournament.dto.CategorySummary;
import org.springframework.stereotype.Component;

@Component
public class RegistrationMapper {

    public RegistrationResponse toResponse(Registration registration) {
        return new RegistrationResponse(
            registration.getId(),
            registration.getUser().getId(),
            registration.getTournament().getId(),
            registration.getTournament().getName(),
            registration.getStatus(),
            registration.getAnswers(),
            registration.getPaymentStatus(),
            registration.getAmountDue(),
            registration.getPaymentReference(),
            registration.getHostNote(),
            categories(registration),
            registration.getCreatedAt(),
            registration.getUpdatedAt()
        );
    }

    public HostRegistrationResponse toHostResponse(Registration registration) {
        var user = registration.getUser();
        return new HostRegistrationResponse(
            registration.getId(),
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhoneNumber(),
            registration.getStatus(),
            registration.getAnswers(),
            registration.getPaymentStatus(),
            registration.getAmountDue(),
            registration.getPaymentReference(),
            registration.getPaymentSubmittedAt(),
            registration.getPaymentReviewedAt(),
            registration.getHostNote(),
            categories(registration),
            registration.getCreatedAt()
        );
    }

    public TournamentParticipantResponse toParticipantResponse(Registration registration) {
        return new TournamentParticipantResponse(
            registration.getId(),
            registration.getUser().getId(),
            registration.getUser().getName(),
            RegistrationStatus.REGISTERED,
            registration.getCategories().stream().map(category -> category.getId()).toList()
        );
    }

    private static List<CategorySummary> categories(Registration registration) {
        return registration.getCategories().stream()
            .sorted(Comparator.comparing(category -> category.getSortOrder()))
            .map(category -> new CategorySummary(category.getId(), category.getName()))
            .toList();
    }
}
