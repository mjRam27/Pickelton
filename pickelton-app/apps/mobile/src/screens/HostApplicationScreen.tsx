// pickelton-app/apps/mobile/src/screens/HostApplicationScreen.tsx
import { useState, type ReactNode } from "react";
import type { CreateTournamentRequest, SubmitHostVerificationRequest } from "@pickelton/api";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { CalendarDays, MapPin, User, Users, Zap } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

export function HostApplicationScreen({ onBack, onSubmit, onCreateTournament }: {
  onBack: () => void;
  onSubmit: (request: SubmitHostVerificationRequest) => Promise<void>;
  onCreateTournament: (request: CreateTournamentRequest) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: "", phoneNumber: "", dateOfBirth: "", organization: "", organizationType: "", socialLink: "",
    location: "", participants: "16", eventDate: "", description: "", address: "", city: "", state: "Karnataka",
    postalCode: "", documentLast4: "", documentUrl: "", selfieUrl: "", tournamentName: "",
  });
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function field(name: keyof typeof form) {
    return { value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) };
  }

  async function submitVerification() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await onSubmit({
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth,
        phoneNumber: form.phoneNumber.replace(/\s/g, ""),
        addressLine1: form.address.trim(),
        city: form.city.trim(),
        stateRegion: form.state.trim(),
        postalCode: form.postalCode.trim(),
        idDocumentType: "AADHAAR",
        idDocumentNumberLast4: form.documentLast4.trim(),
        documentImageUrl: form.documentUrl.trim(),
        selfieWithDocumentUrl: form.selfieUrl.trim(),
        termsAccepted: consented,
        dataProcessingConsent: consented,
      });
      setSuccess("Application submitted for host verification.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  async function createTournament() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await onCreateTournament({
        name: form.tournamentName.trim(),
        description: `${form.description.trim()}\nVenue: ${form.location.trim()}`,
        sportType: "PICKLEBALL",
        tournamentType: "SINGLES",
        entryFee: 0,
        maxPlayers: Number(form.participants) || 16,
        startDate: `${form.eventDate}T09:00:00`,
      });
      setSuccess("Tournament created successfully.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell>
      <AppHeader onBack={onBack} />
      <Text style={styles.title}>BECOME A{"\n"}<Text style={styles.lime}>HOST</Text></Text>
      <Text style={styles.copy}>Join our elite roster of organizers. Apply to host high-visibility tournaments and manage professional events.</Text>
      <FormSection title="PERSONAL INFO">
        <InputField label="FULL NAME" icon={User} placeholder="Full name" {...field("fullName")} />
        <InputField label="PHONE NUMBER" icon={User} placeholder="+91 phone number" keyboardType="phone-pad" {...field("phoneNumber")} />
        <InputField label="DATE OF BIRTH" icon={CalendarDays} placeholder="YYYY-MM-DD" {...field("dateOfBirth")} />
      </FormSection>
      <FormSection title="ORGANIZATION PROFILE">
        <InputField label="ORGANIZATION NAME" icon={Users} placeholder="Club or organization name" {...field("organization")} />
        <InputField label="ORGANIZATION TYPE" placeholder="Select type" {...field("organizationType")} />
        <InputField label="WEBSITE OR SOCIAL LINK" placeholder="https://" autoCapitalize="none" {...field("socialLink")} />
      </FormSection>
      <FormSection title="EVENT LOGISTICS">
        <InputField label="TOURNAMENT NAME" placeholder="Pickelton Open" {...field("tournamentName")} />
        <InputField label="PRIMARY LOCATION" icon={MapPin} placeholder="City / arena" {...field("location")} />
        <InputField label="EXPECTED PARTICIPANTS" placeholder="Estimated player count" keyboardType="number-pad" {...field("participants")} />
        <InputField label="PROPOSED EVENT DATE" icon={CalendarDays} placeholder="YYYY-MM-DD" {...field("eventDate")} />
        <InputField label="EVENT DESCRIPTION" placeholder="Describe your tournament plan, audience and facilities..." multiline {...field("description")} />
      </FormSection>
      <FormSection title="IDENTITY VERIFICATION">
        <InputField label="ADDRESS" icon={MapPin} placeholder="Address line" {...field("address")} />
        <InputField label="CITY" placeholder="City" {...field("city")} />
        <InputField label="STATE" placeholder="Karnataka" {...field("state")} />
        <InputField label="POSTAL CODE" placeholder="Postal code" keyboardType="number-pad" {...field("postalCode")} />
        <InputField label="AADHAAR LAST 4" placeholder="Last four characters" {...field("documentLast4")} />
        <InputField label="DOCUMENT IMAGE URL" placeholder="https://" autoCapitalize="none" {...field("documentUrl")} />
        <InputField label="SELFIE WITH DOCUMENT URL" placeholder="https://" autoCapitalize="none" {...field("selfieUrl")} />
        <PrimaryButton
          label={consented ? "CONSENT ACCEPTED" : "ACCEPT CONSENT & TERMS"}
          variant={consented ? "primary" : "outline"}
          onPress={() => setConsented((current) => !current)}
        />
      </FormSection>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <PrimaryButton label={loading ? "SUBMITTING..." : "SUBMIT APPLICATION"} Icon={Zap} onPress={submitVerification} disabled={loading} style={styles.submit} />
      <PrimaryButton label="CREATE TOURNAMENT" variant="outline" onPress={createTournament} disabled={loading} style={styles.tournament} />
      <Text style={styles.note}>Verification is required before tournament publishing is enabled.</Text>
    </ScreenShell>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <CardContainer style={styles.section}>
      <View style={styles.sectionTitleRow}><View style={styles.marker} /><Text style={styles.sectionTitle}>{title}</Text></View>
      {children}
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 34, fontStyle: "italic", fontWeight: "900", lineHeight: 34, marginTop: 5 },
  lime: { color: colors.lime },
  copy: { color: colors.muted, fontSize: 11, lineHeight: 17, marginBottom: 20, marginTop: 11 },
  section: { marginBottom: 13, paddingBottom: 2 },
  sectionTitleRow: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 16 },
  marker: { backgroundColor: colors.lime, height: 16, width: 2 },
  sectionTitle: { color: colors.text, fontSize: 10, fontWeight: "900" },
  submit: { marginTop: 6 },
  tournament: { marginTop: 10 },
  note: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 12, textAlign: "center" },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15, marginBottom: 12 },
  success: { color: colors.lime, fontSize: 10, lineHeight: 15, marginBottom: 12 },
});
