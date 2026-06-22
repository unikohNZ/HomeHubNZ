import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { EllaActionCard } from "../components/ella/EllaActionCard";
import { EllaActivityFeed } from "../components/ella/EllaActivityFeed";
import { EllaChatPreview } from "../components/ella/EllaChatPreview";
import { EllaFloatingHero } from "../components/ella/EllaFloatingHero";
import { EllaMessageBubble } from "../components/ella/EllaMessageBubble";
import { EllaTypingIndicator } from "../components/ella/EllaTypingIndicator";
import { EllaWelcomeBubble } from "../components/ella/EllaWelcomeBubble";
import { ELLA_NAME } from "../constants/branding";
import { ELLA_IMAGES, ELLA_PAGE } from "../src/constants/ellaTheme";
import { spacing } from "../constants/design";
import { DemoRole } from "../types";
import {
  buildChatPreview,
  buildRecentActivity,
  createEllaMessage,
  EllaContext,
  EllaMessage,
  generateEllaReply,
  getEllaQuickActions,
  getQuickActionReply,
} from "../src/services/ellaService";

const NAV_CLEARANCE = 100;
const TYPING_MS = 850;

interface EllaScreenProps {
  role: DemoRole;
  userName?: string;
  propertyName?: string | null;
  nextRentDate?: string | null;
  nextRentAmount?: number;
  rentDaysUntil?: number | null;
  notificationCount?: number;
  maintenanceActive?: number;
  documentCount?: number;
  monthlyIncome?: number;
  collectedThisMonth?: number;
  outstandingRent?: number;
  propertyCount?: number;
  pendingJoinRequests?: number;
  occupancyRate?: number;
  activeMaintenanceTitles?: string[];
  overdueTenants?: EllaContext["overdueTenants"];
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function EllaScreen({
  role,
  userName,
  propertyName,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  notificationCount = 0,
  maintenanceActive = 0,
  documentCount = 0,
  monthlyIncome,
  collectedThisMonth,
  outstandingRent,
  propertyCount,
  pendingJoinRequests,
  occupancyRate,
  activeMaintenanceTitles,
  overdueTenants,
  onOpenMenu,
  onOpenSettings,
}: EllaScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [liveMessages, setLiveMessages] = useState<EllaMessage[]>([]);
  const [chatExpanded, setChatExpanded] = useState(false);

  const ctx: EllaContext = useMemo(
    () => ({
      role,
      userName,
      propertyName: propertyName ?? undefined,
      nextRentDate,
      nextRentAmount,
      rentDaysUntil,
      notificationCount,
      maintenanceActive,
      documentCount,
      monthlyIncome,
      collectedThisMonth,
      outstandingRent,
      propertyCount,
      pendingJoinRequests,
      occupancyRate,
      activeMaintenanceTitles,
      overdueTenants,
    }),
    [
      role,
      userName,
      propertyName,
      nextRentDate,
      nextRentAmount,
      rentDaysUntil,
      notificationCount,
      maintenanceActive,
      documentCount,
      monthlyIncome,
      collectedThisMonth,
      outstandingRent,
      propertyCount,
      pendingJoinRequests,
      occupancyRate,
      activeMaintenanceTitles,
      overdueTenants,
    ],
  );

  const quickActions = useMemo(() => getEllaQuickActions(role), [role]);

  const activityItems = useMemo(() => buildRecentActivity(ctx), [ctx]);
  const previewMessages = useMemo(() => buildChatPreview(ctx), [ctx]);
  const showPreview = liveMessages.length === 0 && !chatExpanded;

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const sendExchange = async (userText: string, replyText: string) => {
    setChatExpanded(true);
    setLiveMessages((prev) => [...prev, createEllaMessage(userText, "user")]);
    setDraft("");
    setTyping(true);
    scrollToEnd();

    await new Promise((r) => setTimeout(r, TYPING_MS));

    setLiveMessages((prev) => [...prev, createEllaMessage(replyText, "assistant")]);
    setTyping(false);
    scrollToEnd();
  };

  const handleQuickAction = async (actionId: string, userMessage: string) => {
    if (typing) return;
    if (actionId === "tenant-ask" || actionId === "landlord-ask") {
      setChatExpanded(true);
      inputRef.current?.focus();
      return;
    }
    await sendExchange(userMessage, getQuickActionReply(actionId, ctx));
  };

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || typing) return;

    setChatExpanded(true);
    setLiveMessages((prev) => [...prev, createEllaMessage(trimmed, "user")]);
    setDraft("");
    setTyping(true);
    scrollToEnd();

    await new Promise((r) => setTimeout(r, TYPING_MS));

    try {
      const reply = await generateEllaReply(trimmed, ctx);
      setLiveMessages((prev) => [...prev, createEllaMessage(reply, "assistant")]);
    } finally {
      setTyping(false);
      scrollToEnd();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <LinearGradient
        colors={[ELLA_PAGE.gradientTop, ELLA_PAGE.gradientMid, ELLA_PAGE.background]}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.headerBtn} onPress={onOpenMenu} accessibilityLabel="Menu">
              <Text style={styles.headerIcon}>☰</Text>
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{ELLA_NAME}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
            <Pressable style={styles.headerBtn} onPress={onOpenSettings} accessibilityLabel="Settings">
              <Text style={styles.headerIcon}>⚙️</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <EllaFloatingHero />
              <EllaWelcomeBubble userName={userName} role={role} />

              <SectionTitle>What can I help with?</SectionTitle>
              <View style={styles.actionGrid}>
                {quickActions.map((action) => (
                  <EllaActionCard
                    key={action.id}
                    icon={action.icon}
                    title={action.label}
                    accent={action.accent}
                    disabled={typing}
                    onPress={() => handleQuickAction(action.id, action.userMessage)}
                  />
                ))}
              </View>

              <SectionTitle>Recent activity</SectionTitle>
              <EllaActivityFeed items={activityItems} />

              <SectionTitle>
                {liveMessages.length > 0 ? "Conversation" : "Continue chatting"}
              </SectionTitle>

              {showPreview ? (
                <EllaChatPreview
                  messages={previewMessages}
                  onContinue={() => {
                    setChatExpanded(true);
                    inputRef.current?.focus();
                  }}
                />
              ) : (
                <View style={styles.liveChat}>
                  {(liveMessages.length > 0 ? liveMessages : previewMessages.map((m, i) => ({
                    ...createEllaMessage(m.content, m.role),
                    id: `preview-${i}`,
                  }))).map((m) => (
                    <EllaMessageBubble
                      key={m.id}
                      role={m.role}
                      content={m.content}
                      avatarSource={m.role === "assistant" ? ELLA_IMAGES.happy : undefined}
                    />
                  ))}
                  {typing && <EllaTypingIndicator />}
                </View>
              )}
            </ScrollView>

            <View style={styles.inputBar}>
              <View style={styles.inputWrap}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Ask Ella anything..."
                  placeholderTextColor={ELLA_PAGE.textMuted}
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={handleSend}
                  editable={!typing}
                  returnKeyType="send"
                />
              </View>
              <Pressable
                style={[styles.sendBtn, (!draft.trim() || typing) && styles.sendDisabled]}
                onPress={handleSend}
                disabled={!draft.trim() || typing}
                accessibilityLabel="Send"
              >
                <Text style={styles.sendArrow}>↑</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ELLA_PAGE.background },
  gradient: { flex: 1 },
  inner: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.08)",
  },
  headerIcon: { fontSize: 18 },
  headerCenter: { alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: ELLA_PAGE.text,
    letterSpacing: -0.5,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ELLA_PAGE.online,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: ELLA_PAGE.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: ELLA_PAGE.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  liveChat: {
    marginBottom: spacing.sm,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: NAV_CLEARANCE,
    backgroundColor: ELLA_PAGE.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(124, 58, 237, 0.12)",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: ELLA_PAGE.card,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "rgba(124, 58, 237, 0.14)",
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "web" ? 14 : 16,
    fontSize: 16,
    color: ELLA_PAGE.text,
    minHeight: 52,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ELLA_PAGE.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.4 },
  sendArrow: { color: "#FFF", fontSize: 24, fontWeight: "800" },
});
