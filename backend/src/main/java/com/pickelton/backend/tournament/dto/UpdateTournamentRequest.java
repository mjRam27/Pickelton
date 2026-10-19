package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// Every field is optional; only the ones sent are changed.
public record UpdateTournamentRequest(
    @Size(min = 1, max = 255, message = "Tournament name must be between 1 and 255 characters") String name,
    @Size(max = 3000, message = "Description must be at most 3000 characters") String description,
    @PositiveOrZero(message = "Entry fee cannot be negative") BigDecimal entryFee,
    @Min(value = 2, message = "Max players must be at least 2") Integer maxPlayers,
    @Future(message = "Start date must be in the future") LocalDateTime startDate,
    @Size(max = 255) String venue,
    LocalDateTime registrationDeadline,
    @Size(max = 100) @Pattern(regexp = CreateTournamentRequest.UPI_ID, message = "Enter a valid UPI ID, like name@okhdfcbank") String upiId,
    @Size(max = 120) String payeeName,
    @Size(max = 1000) String paymentInstructions,
    @Valid @Size(max = 15, message = "At most 15 registration questions") List<RegistrationQuestion> registrationQuestions,
    @Valid @Size(max = 12, message = "At most 12 categories") List<CategoryRequest> categories
) {
}
