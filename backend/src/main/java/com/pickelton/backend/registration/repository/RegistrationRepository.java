package com.pickelton.backend.registration.repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pickelton.backend.enums.RegistrationStatus;
import com.pickelton.backend.registration.entity.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    boolean existsByTournamentIdAndUserId(UUID tournamentId, UUID userId);

    boolean existsByTournamentIdAndUserIdAndStatus(UUID tournamentId, UUID userId, RegistrationStatus status);

    Optional<Registration> findByTournamentIdAndUserId(UUID tournamentId, UUID userId);

    long countByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);

    List<Registration> findByTournamentId(UUID tournamentId);

    List<Registration> findByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);

    List<Registration> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Registration> findByTournamentIdOrderByCreatedAtAsc(UUID tournamentId);

    // Stops one UPI reference being reused for two registrations in the same tournament.
    boolean existsByTournamentIdAndPaymentReferenceIgnoreCaseAndIdNot(UUID tournamentId, String paymentReference, UUID id);

    // Active registrations per category of one event, as [categoryId, count] rows.
    @Query("""
        SELECT c.id, COUNT(r) FROM Registration r JOIN r.categories c
        WHERE r.tournament.id = :tournamentId AND r.status = :status
        GROUP BY c.id
        """)
    List<Object[]> countByCategory(@Param("tournamentId") UUID tournamentId, @Param("status") RegistrationStatus status);

    @Query("""
        SELECT COUNT(r) > 0 FROM Registration r JOIN r.categories c
        WHERE r.tournament.id = :tournamentId AND r.user.id = :userId AND c.id = :categoryId AND r.status = :status
        """)
    boolean isRegisteredInCategory(@Param("tournamentId") UUID tournamentId, @Param("userId") UUID userId,
                                   @Param("categoryId") UUID categoryId, @Param("status") RegistrationStatus status);
}
