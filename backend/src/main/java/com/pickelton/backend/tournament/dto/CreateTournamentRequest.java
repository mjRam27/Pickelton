package com.pickelton.backend.tournament.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.enums.SportType;
import com.pickelton.backend.enums.TournamentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateTournamentRequest(
    @NotBlank(message = "Tournament name is required") @Size(max = 255) String name,
    @Size(max = 3000) String description,
    @NotNull(message = "Sport type is required") SportType sportType,
    @NotNull(message = "Tournament type is required") TournamentType tournamentType,
    UUID clubId,
    @PositiveOrZero(message = "Entry fee cannot be negative") BigDecimal entryFee,
    @NotNull(message = "Max players is required") @Min(value = 2, message = "Max players must be at least 2") Integer maxPlayers,
    @NotNull(message = "Start date is required") @Future(message = "Start date must be in the future") LocalDateTime startDate,
    @Size(max = 255) String venue,
    LocalDateTime registrationDeadline,
    @Size(max = 100) @Pattern(regexp = UPI_ID, message = "Enter a valid UPI ID, like name@okhdfcbank") String upiId,
    @Size(max = 120) String payeeName,
    @Size(max = 1000) String paymentInstructions,
    @Valid @Size(max = 15, message = "At most 15 registration questions") List<RegistrationQuestion> registrationQuestions,
    @Valid @Size(max = 12, message = "At most 12 categories") List<CategoryRequest> categories
) {
    public static final String UPI_ID = "^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$";
}
