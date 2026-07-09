package com.pickelton.backend.registrationform.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ForbiddenException;
import com.pickelton.backend.common.exception.ResourceNotFoundException;
import com.pickelton.backend.common.service.CurrentUserService;
import com.pickelton.backend.enums.FormStatus;
import com.pickelton.backend.enums.PlatformRole;
import com.pickelton.backend.registrationform.dto.FormFieldRequest;
import com.pickelton.backend.registrationform.dto.FormFieldResponse;
import com.pickelton.backend.registrationform.dto.RegistrationFormResponse;
import com.pickelton.backend.registrationform.dto.SaveRegistrationFormRequest;
import com.pickelton.backend.registrationform.entity.RegistrationFormField;
import com.pickelton.backend.registrationform.entity.TournamentRegistrationForm;
import com.pickelton.backend.registrationform.repository.RegistrationFormFieldRepository;
import com.pickelton.backend.registrationform.repository.TournamentRegistrationFormRepository;
import com.pickelton.backend.tournament.entity.Tournament;
import com.pickelton.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationFormService {

    private final TournamentRegistrationFormRepository formRepository;
    private final RegistrationFormFieldRepository fieldRepository;
    private final TournamentRepository tournamentRepository;
    private final CurrentUserService currentUserService;

    public RegistrationFormResponse saveDraft(UUID tournamentId, SaveRegistrationFormRequest request) {
        Tournament tournament = requireTournament(tournamentId);
        requireOrganizer(tournament);
        TournamentRegistrationForm latest = formRepository.findFirstByTournamentIdOrderByVersionDesc(tournamentId).orElse(null);
        TournamentRegistrationForm form;
        if (latest == null || latest.getStatus() == FormStatus.PUBLISHED) {
            form = formRepository.save(TournamentRegistrationForm.builder()
                .tournament(tournament)
                .version(latest == null ? 1 : latest.getVersion() + 1)
                .status(FormStatus.DRAFT)
                .createdBy(currentUserService.getCurrentUser())
                .build());
        } else {
            form = latest;
            fieldRepository.deleteByFormId(form.getId());
        }
        saveFields(form, request.fields());
        return toResponse(form);
    }

    public RegistrationFormResponse publish(UUID tournamentId) {
        Tournament tournament = requireTournament(tournamentId);
        requireOrganizer(tournament);
        TournamentRegistrationForm form = formRepository.findFirstByTournamentIdOrderByVersionDesc(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration form not found"));
        if (fieldRepository.findByFormIdOrderByDisplayOrderAsc(form.getId()).isEmpty()) {
            throw new BadRequestException("Registration form needs at least one field before publishing");
        }
        form.setStatus(FormStatus.PUBLISHED);
        form.setPublishedAt(OffsetDateTime.now());
        return toResponse(formRepository.save(form));
    }

    @Transactional(readOnly = true)
    public RegistrationFormResponse getLatest(UUID tournamentId) {
        return formRepository.findFirstByTournamentIdOrderByVersionDesc(tournamentId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Registration form not found"));
    }

    @Transactional(readOnly = true)
    public RegistrationFormResponse getPublished(UUID tournamentId) {
        return formRepository.findFirstByTournamentIdAndStatusOrderByVersionDesc(tournamentId, FormStatus.PUBLISHED)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Published registration form not found"));
    }

    private void saveFields(TournamentRegistrationForm form, List<FormFieldRequest> fields) {
        fields.stream()
            .map(request -> RegistrationFormField.builder()
                .form(form)
                .fieldKey(request.fieldKey().trim())
                .label(request.label().trim())
                .type(request.type())
                .placeholder(request.placeholder())
                .helpText(request.helpText())
                .required(request.required())
                .enabled(request.enabled())
                .displayOrder(request.displayOrder())
                .defaultValue(request.defaultValue() == null ? new LinkedHashMap<>() : request.defaultValue())
                .validationRules(request.validationRules() == null ? new LinkedHashMap<>() : request.validationRules())
                .options(request.options() == null ? new LinkedHashMap<>() : request.options())
                .build())
            .forEach(fieldRepository::save);
    }

    private Tournament requireTournament(UUID tournamentId) {
        return tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private void requireOrganizer(Tournament tournament) {
        var currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() == PlatformRole.ADMIN) {
            return;
        }
        if (!tournament.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the tournament host can manage the registration form");
        }
    }

    private RegistrationFormResponse toResponse(TournamentRegistrationForm form) {
        return new RegistrationFormResponse(
            form.getId(),
            form.getTournament().getId(),
            form.getVersion(),
            form.getStatus(),
            fieldRepository.findByFormIdOrderByDisplayOrderAsc(form.getId()).stream().map(this::toFieldResponse).toList(),
            form.getPublishedAt(),
            form.getCreatedAt()
        );
    }

    private FormFieldResponse toFieldResponse(RegistrationFormField field) {
        return new FormFieldResponse(
            field.getId(),
            field.getFieldKey(),
            field.getLabel(),
            field.getType(),
            field.getPlaceholder(),
            field.getHelpText(),
            field.isRequired(),
            field.isEnabled(),
            field.getDisplayOrder(),
            field.getDefaultValue(),
            field.getValidationRules(),
            field.getOptions()
        );
    }
}
