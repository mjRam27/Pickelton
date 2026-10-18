import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Badge, type BadgeTone } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Display } from "../../components/Typography";
import { apiErrorMessage, fetchHostStatus, type HostVerification } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

const COPY: Record<string, { badge: string; tone: BadgeTone; title: string; body: string }> = {
  APPROVED: { badge: "Approved", tone: "accent", title: "You're a verified host", body: "You can now create tournaments and collect entry fees in the app." },
  REJECTED: { badge: "Not approved", tone: "hot", title: "We couldn't verify you", body: "Check the reason below, update your details and apply again." },
  PENDING: { badge: "In review", tone: "blue", title: "We're checking your details", body: "Most applications are decided within 2 working days. We'll notify you when there's a decision." },
};

export default function HostStatusScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [status, setStatus] = useState<HostVerification | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setStatus(await fetchHostStatus());
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const state = status?.status ?? "";
  const copy = COPY[state] ?? COPY.PENDING;
  const decided = state === "APPROVED" || state === "REJECTED";
  const steps = [
    { title: "Application submitted", detail: status ? new Date(status.submittedAt).toLocaleString("en-IN", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" }) : "", done: true },
    { title: "Identity review", detail: "Checking your document and selfie", done: decided },
    { title: "Decision & blue badge", detail: status?.reviewedAt ? new Date(status.reviewedAt).toLocaleDateString("en-IN") : "We'll notify you by push and email", done: decided },
  ];

  return (
    <Screen
      footer={loaded && status ? (state === "APPROVED"
        ? <Button icon="add" label="Create a tournament" onPress={() => router.push("/tournaments/create")} />
        : <Button label={state === "REJECTED" ? "Update application" : "Edit application"} onPress={() => router.push("/host/apply")} variant={state === "REJECTED" ? "primary" : "outline"} />) : undefined}
      onRefresh={load}
    >
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/profile"))} />
        <Text style={styles.headerTitle}>Host application</Text>
      </View>
      <Notice message={error} />
      {!loaded ? <LoadingState label="Loading your application" /> : !status ? (
        <EmptyState action="Apply to host" copy="Verify your identity to run tournaments and take entry fees in the app." icon="shield-checkmark-outline" onAction={() => router.push("/host/apply")} title="No application yet" />
      ) : <>
        <View style={styles.card}>
          <Svg fill={colors.blu} height={160} opacity={0.12} style={styles.cardArt} viewBox="0 0 24 24" width={160}>
            <Path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" />
          </Svg>
          <Badge label={copy.badge} tone={copy.tone} />
          <Display size={44}>{copy.title}</Display>
          <Text style={styles.body}>{copy.body}</Text>
          {status.rejectionReason ? <Notice message={status.rejectionReason} /> : null}
          <Text style={styles.reference}>Reference {status.id.slice(0, 8).toUpperCase()} · {status.fullName}</Text>
        </View>
        <View>
          {steps.map((step, index) => {
            const current = !step.done && (index === 0 || steps[index - 1].done);
            return (
              <View key={step.title} style={styles.step}>
                <View style={styles.rail}>
                  <View style={[styles.dot, step.done && styles.dotDone, current && styles.dotCurrent]}>
                    {step.done ? <Ionicons color={colors.onAcc} name="checkmark" size={18} /> : <Text style={[styles.dotText, current && { color: colors.bluInk }]}>{index + 1}</Text>}
                  </View>
                  {index < steps.length - 1 ? <View style={[styles.line, step.done && styles.lineDone]} /> : null}
                </View>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, !step.done && !current && styles.mutedText]}>{step.title}</Text>
                  {step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      </>}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerTitle: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  card: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 24, borderWidth: 1, gap: 10, overflow: "hidden", padding: 20 },
  cardArt: { position: "absolute", right: -30, top: -20 },
  body: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  reference: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  step: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 32 },
  dot: { alignItems: "center", borderColor: colors.line, borderRadius: 16, borderWidth: 2, height: 32, justifyContent: "center", width: 32 },
  dotDone: { backgroundColor: colors.acc, borderColor: colors.acc },
  dotCurrent: { borderColor: colors.blu },
  dotText: { color: colors.muted, fontFamily: fonts.heavy, fontSize: 13 },
  line: { backgroundColor: colors.line, flex: 1, minHeight: 18, width: 2 },
  lineDone: { backgroundColor: colors.acc },
  stepCopy: { flex: 1, gap: 2, paddingBottom: 18 },
  stepTitle: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  mutedText: { color: colors.muted },
  stepDetail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
});
