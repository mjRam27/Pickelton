package com.pickelton.backend.registrationform.repository;

import java.util.List;
import java.util.UUID;

import com.pickelton.backend.registrationform.entity.RegistrationFormField;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationFormFieldRepository extends JpaRepository<RegistrationFormField, UUID> {

    List<RegistrationFormField> findByFormIdOrderByDisplayOrderAsc(UUID formId);

    void deleteByFormId(UUID formId);
}
