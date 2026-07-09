import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../../components/AppHeader";
import { CardContainer } from "../../../components/CardContainer";
import { InputField } from "../../../components/InputField";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { SectionHeader } from "../../../components/SectionHeader";
import { StatusPill } from "../../../components/StatusPill";
import { apiErrorMessage, fetchRegistrationForm, publishRegistrationForm, saveRegistrationForm, type FormFieldType, type RegistrationFormField } from "../../../services/api";
import type { ThemeColors } from "../../../theme/colors";
import { useTheme, useThemeStyles } from "../../../theme/ThemeProvider";

const defaultFields: RegistrationFormField[] = [
  { fieldKey: "player_name", label: "Player Name", type: "PLAYER_NAME", placeholder: "Your full name", required: true, enabled: true, displayOrder: 1, validationRules: {}, options: {} },
  { fieldKey: "phone", label: "Phone Number", type: "PHONE", placeholder: "+91...", required: true, enabled: true, displayOrder: 2, validationRules: {}, options: {} },
  { fieldKey: "skill_level", label: "Skill Level", type: "SKILL_LEVEL", placeholder: "Beginner / Intermediate / Advanced", required: false, enabled: true, displayOrder: 3, validationRules: {}, options: { values: ["Beginner", "Intermediate", "Advanced"] } },
];

const fieldTypes: FormFieldType[] = ["SHORT_TEXT", "NUMBER", "EMAIL", "PHONE", "DROPDOWN", "YES_NO", "TEAM_NAME", "SKILL_LEVEL"];

export default function RegistrationFormBuilderScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fields, setFields] = useState<RegistrationFormField[]>(defaultFields);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const versionLabel = useMemo(() => `${fields.length} fields`, [fields.length]);

  useEffect(() => {
    if (!id) return;
    fetchRegistrationForm(id)
      .then((form) => setFields(form.fields.length ? form.fields : defaultFields))
      .catch(() => undefined);
  }, [id]);

  function updateField(index: number, patch: Partial<RegistrationFormField>) {
    setFields((current) => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));
  }

  function addField(type: FormFieldType) {
    setFields((current) => [...current, {
      fieldKey: `custom_${current.length + 1}`,
      label: "Custom Field",
      type,
      placeholder: "Enter value",
      required: false,
      enabled: true,
      displayOrder: current.length + 1,
      validationRules: {},
      options: {},
    }]);
  }

  function removeField(index: number) {
    setFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index).map((field, fieldIndex) => ({ ...field, displayOrder: fieldIndex + 1 })));
  }

  async function save(publish = false) {
    try {
      setError("");
      const normalized = fields.map((field, index) => ({
        ...field,
        fieldKey: field.fieldKey.trim() || `field_${index + 1}`,
        label: field.label.trim() || `Field ${index + 1}`,
        displayOrder: index + 1,
        defaultValue: field.defaultValue ?? {},
        validationRules: field.validationRules ?? {},
        options: field.options ?? {},
      }));
      await saveRegistrationForm(id, normalized);
      if (publish) await publishRegistrationForm(id);
      setMessage(publish ? "Registration form published." : "Draft saved.");
      if (publish) setTimeout(() => router.back(), 500);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader eyebrow="FORM BUILDER" title="Registration setup" />
          <View style={styles.headerRow}>
            <Text style={styles.title}>HOST FORM</Text>
            <StatusPill label={versionLabel} tone="primary" />
          </View>
          <Text style={styles.copy}>Create the fields players must complete before host review.</Text>

          <SectionHeader title="Add field" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeStrip}>
            {fieldTypes.map((type) => <Pressable key={type} onPress={() => addField(type)} style={styles.typeChip}><Text style={styles.typeChipText}>{type.replaceAll("_", " ")}</Text></Pressable>)}
          </ScrollView>

          <SectionHeader title="Fields" />
          {fields.map((field, index) => (
            <CardContainer key={`${field.fieldKey}-${index}`} style={styles.fieldCard}>
              <View style={styles.fieldTop}>
                <View style={styles.fieldIcon}><Ionicons color={colors.primary} name="reorder-two-outline" size={20} /></View>
                <Text style={styles.fieldTitle}>#{index + 1} / {field.type.replaceAll("_", " ")}</Text>
                <Pressable onPress={() => removeField(index)}><Ionicons color={colors.danger} name="trash-outline" size={19} /></Pressable>
              </View>
              <InputField label="LABEL" value={field.label} onChangeText={(value) => updateField(index, { label: value })} />
              <InputField label="FIELD KEY" autoCapitalize="none" value={field.fieldKey} onChangeText={(value) => updateField(index, { fieldKey: value })} />
              <InputField label="PLACEHOLDER" value={field.placeholder ?? ""} onChangeText={(value) => updateField(index, { placeholder: value })} />
              <View style={styles.toggles}>
                <PrimaryButton label={field.required ? "Required" : "Optional"} variant={field.required ? "primary" : "outline"} onPress={() => updateField(index, { required: !field.required })} style={styles.toggle} />
                <PrimaryButton label={field.enabled ? "Enabled" : "Disabled"} variant={field.enabled ? "primary" : "outline"} onPress={() => updateField(index, { enabled: !field.enabled })} style={styles.toggle} />
              </View>
            </CardContainer>
          ))}

          {message ? <Text style={styles.success}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <PrimaryButton label="Save draft" variant="outline" onPress={() => save(false)} style={styles.action} />
            <PrimaryButton label="Publish" onPress={() => save(true)} style={styles.action} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  title: { color: colors.text, fontSize: 34, fontWeight: "900" },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  typeStrip: { gap: 8, paddingBottom: 2 },
  typeChip: { backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10 },
  typeChipText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  fieldCard: { borderTopColor: colors.accent, borderTopWidth: 4, marginBottom: 12 },
  fieldTop: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 12 },
  fieldIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 12, height: 36, justifyContent: "center", width: 36 },
  fieldTitle: { color: colors.text, flex: 1, fontSize: 13, fontWeight: "900" },
  toggles: { flexDirection: "row", gap: 8 },
  toggle: { flex: 1 },
  success: { color: colors.primary, fontSize: 12, fontWeight: "800", marginBottom: 10 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "800", marginBottom: 10 },
  actions: { flexDirection: "row", gap: 8 },
  action: { flex: 1 },
});
