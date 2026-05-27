// pickelton-app/apps/mobile/src/screens/HomeScreen.tsx
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { CalendarDays, Plus, Swords, Users } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/SectionHeader";
import { Tag } from "../components/Tag";
import { images } from "../constants/mockData";
import { colors } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

export function HomeScreen({ onCreateMatch, onScoring, onClubs, onCommunity, onHost, onRequestPhoneCode, onVerifyPhoneCode, notice }: {
  onCreateMatch: () => void;
  onScoring: () => void;
  onClubs: () => void;
  onCommunity: () => void;
  onHost: () => void;
  onRequestPhoneCode: () => Promise<void>;
  onVerifyPhoneCode: (code: string) => Promise<void>;
  notice?: string;
}) {
  const [showVerification, setShowVerification] = useState(false);
  const [code, setCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");

  async function requestCode() {
    setVerificationError("");
    try {
      await onRequestPhoneCode();
      setShowVerification(true);
      setVerificationMessage("Verification code sent to your phone.");
    } catch (cause) {
      setVerificationError(errorMessage(cause));
    }
  }

  async function verifyCode() {
    setVerificationError("");
    try {
      await onVerifyPhoneCode(code);
      setVerificationMessage("Phone number verified. Host and club tools are enabled.");
      setShowVerification(false);
    } catch (cause) {
      setVerificationError(errorMessage(cause));
    }
  }

  return (
    <ScreenShell>
      <AppHeader />
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <CardContainer style={styles.verification}>
        <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
        <Text style={styles.muted}>Verify your phone to host tournaments and create clubs.</Text>
        {showVerification ? <InputField label="OTP CODE" placeholder="Enter verification code" keyboardType="number-pad" value={code} onChangeText={setCode} /> : null}
        {verificationError ? <Text style={styles.error}>{verificationError}</Text> : null}
        {verificationMessage ? <Text style={styles.success}>{verificationMessage}</Text> : null}
        <PrimaryButton label={showVerification ? "VERIFY PHONE" : "SEND PHONE OTP"} variant="outline" onPress={showVerification ? verifyCode : requestCode} />
      </CardContainer>
      <CardContainer style={styles.feature}>
        <Image source={{ uri: images.live }} style={styles.photo} />
        <View style={styles.overlay}>
          <Tag>LIVE NOW</Tag>
          <Text style={styles.heroTitle}>OPEN COURT{"\n"}CHALLENGE</Text>
          <PrimaryButton label="CREATE MATCH" Icon={Plus} onPress={onCreateMatch} style={styles.heroButton} />
        </View>
      </CardContainer>
      <CardContainer style={styles.velocity}>
        <Text style={styles.eyebrow}>YOUR WEEKLY VELOCITY</Text>
        <Text style={styles.xp}>1,240 <Text style={styles.lime}>XP</Text></Text>
        <Text style={styles.muted}>Top 5% of players in Bengaluru</Text>
        <View style={styles.progress}><View style={styles.progressFill} /></View>
      </CardContainer>
      <SectionHeader title="QUICK ACTIONS" />
      <View style={styles.actions}>
        <ActionTile label="CREATE MATCH" Icon={Swords} onPress={onCreateMatch} />
        <ActionTile label="LIVE SCORE" Icon={CalendarDays} onPress={onScoring} />
        <ActionTile label="CLUBS" Icon={Users} onPress={onClubs} />
        <ActionTile label="COMMUNITY" Icon={Users} onPress={onCommunity} />
      </View>
      <SectionHeader title="BECOME A HOST" />
      <CardContainer style={styles.host}>
        <View style={styles.hostText}>
          <Text style={styles.hostTitle}>UNLOCK ELITE{"\n"}MATCHDAYS</Text>
          <Text style={styles.muted}>Create tournaments after verification.</Text>
        </View>
        <PrimaryButton label="APPLY" onPress={onHost} style={styles.apply} />
      </CardContainer>
    </ScreenShell>
  );
}

function ActionTile({ label, Icon, onPress }: { label: string; Icon: typeof Swords; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Icon size={21} color={colors.lime} />
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  feature: { marginBottom: 12, overflow: "hidden", padding: 0 },
  photo: { height: 184, opacity: 0.56, width: "100%" },
  overlay: { bottom: 14, left: 14, position: "absolute" },
  heroTitle: { color: colors.text, fontSize: 23, fontStyle: "italic", fontWeight: "900", lineHeight: 24, marginVertical: 11 },
  heroButton: { minHeight: 40 },
  velocity: { borderLeftColor: colors.lime, borderLeftWidth: 3, gap: 7, marginBottom: 4 },
  eyebrow: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  xp: { color: colors.text, fontSize: 32, fontWeight: "900" },
  lime: { color: colors.lime, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  progress: { backgroundColor: colors.border, borderRadius: 3, height: 5, marginTop: 10 },
  progressFill: { backgroundColor: colors.lime, height: 5, width: "78%" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  tile: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: 10, justifyContent: "center", minHeight: 94, width: "48.5%" },
  tileLabel: { color: colors.text, fontSize: 10, fontWeight: "800" },
  host: { alignItems: "center", flexDirection: "row", gap: 12 },
  hostText: { flex: 1 },
  hostTitle: { color: colors.text, fontSize: 16, fontStyle: "italic", fontWeight: "900", marginBottom: 5 },
  apply: { minHeight: 39, paddingHorizontal: 13 },
  notice: { backgroundColor: colors.limeDim, borderRadius: 6, color: colors.lime, fontSize: 10, fontWeight: "800", marginBottom: 12, padding: 11 },
  verification: { gap: 12, marginBottom: 12 },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15 },
  success: { color: colors.lime, fontSize: 10, lineHeight: 15 },
});
