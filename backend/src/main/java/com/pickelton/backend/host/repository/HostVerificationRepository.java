package com.pickelton.backend.host.repository;

import java.util.Optional;
import java.util.UUID;

import com.pickelton.backend.enums.HostVerificationStatus;
import com.pickelton.backend.host.entity.HostVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HostVerificationRepository extends JpaRepository<HostVerification, UUID> {

    Optional<HostVerification> findByUserId(UUID userId);

    boolean existsByUserIdAndStatus(UUID userId, HostVerificationStatus status);
}
