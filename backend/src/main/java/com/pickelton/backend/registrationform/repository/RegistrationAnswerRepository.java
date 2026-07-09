package com.pickelton.backend.registrationform.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.registrationform.entity.RegistrationAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationAnswerRepository extends JpaRepository<RegistrationAnswer, UUID> {

    List<RegistrationAnswer> findByRegistrationId(UUID registrationId);
}
