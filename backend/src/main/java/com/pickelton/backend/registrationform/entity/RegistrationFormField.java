package com.pickelton.backend.registrationform.entity;

import java.util.LinkedHashMap;
import java.util.Map;

import com.pickelton.backend.common.entity.BaseEntity;
import com.pickelton.backend.enums.FormFieldType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "registration_form_fields",
    uniqueConstraints = @UniqueConstraint(name = "uk_form_field_key", columnNames = {"form_id", "field_key"}))
public class RegistrationFormField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private TournamentRegistrationForm form;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(nullable = false, length = 160)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FormFieldType type;

    @Column(length = 255)
    private String placeholder;

    @Column(name = "help_text", length = 500)
    private String helpText;

    @Builder.Default
    @Column(nullable = false)
    private boolean required = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "default_value", columnDefinition = "jsonb")
    private Map<String, Object> defaultValue = new LinkedHashMap<>();

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_rules", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> validationRules = new LinkedHashMap<>();

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> options = new LinkedHashMap<>();
}
