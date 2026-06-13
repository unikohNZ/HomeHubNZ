import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BottomNavigation } from "./components/BottomNavigation";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { DEFAULT_RULES } from "./data/constants";
import { EMPTY_PROPERTY_FORM, nextId } from "./data/formDefaults";
import { INITIAL_JOIN_REQUESTS, MOCK_CHAT_MESSAGES, MOCK_CONVERSATIONS } from "./data/mockMessages";
import { MOCK_PROPERTIES } from "./data/mockProperties";
import { MOCK_RENT_PAYMENTS } from "./data/mockRent";
import { FLATMATE_USER } from "./data/mockUsers";
import { ChatScreen } from "./screens/ChatScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { MessagesScreen } from "./screens/MessagesScreen";
import { MyFlatScreen } from "./screens/MyFlatScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { PropertiesScreen } from "./screens/PropertiesScreen";
import { RentScreen } from "./screens/RentScreen";
import { RequestsScreen } from "./screens/RequestsScreen";
import { DemoRole, OverlayScreen, TabId } from "./types";
import { ChatMessage, Conversation } from "./types/message";
import { Property, PropertyFormData } from "./types/property";
import { JoinRequest } from "./types/request";
import { RentPayment } from "./types/rent";
import { buildRentSections, getNextRentDate } from "./utils/rentHelpers";

const PHONE_MAX = 430;
const MAINTENANCE_COUNT = 2;

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HomeHubApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function HomeHubApp() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [demoRole, setDemoRole] = useState<DemoRole>("flatmate");
  const [tab, setTab] = useState<TabId>("home");
  const [overlay, setOverlay] = useState<OverlayScreen>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(INITIAL_JOIN_REQUESTS);
  const [rentPayments] = useState<RentPayment[]>(MOCK_RENT_PAYMENTS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(MOCK_CHAT_MESSAGES);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormData>(EMPTY_PROPERTY_FORM);
  const [leftFlat, setLeftFlat] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const myJoinRequests = joinRequests.filter(
    (r) => r.flatmate_name === FLATMATE_USER.name || r.flatmate_email === FLATMATE_USER.email,
  );
  const approvedJoin = myJoinRequests.find((r) => r.status === "approved" && !leftFlat);
  const joinedProperty = approvedJoin
    ? properties.find((p) => p.id === approvedJoin.property_id) ?? null
    : null;

  const pendingLandlordRequests = joinRequests.filter((r) => r.status === "pending");

  const rentSections = useMemo(() => buildRentSections(rentPayments), [rentPayments]);
  const nextRentDate = useMemo(() => getNextRentDate(rentPayments), [rentPayments]);

  const monthlyIncome = useMemo(
    () => properties.reduce((s, p) => s + p.weekly_rent * 4, 0),
    [properties],
  );

  const flatmateRentDue =
    rentSections.current_due_total + rentSections.overdue_total;
  const upcomingBills = rentSections.upcoming.length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    );
  }, [properties, searchQuery]);

  const unreadMessages = conversations.reduce((s, c) => s + c.unread_count, 0);

  const resetForm = () => {
    setForm(EMPTY_PROPERTY_FORM);
    setEditingId(null);
    setShowPropertyForm(false);
  };

  const loadForm = (p: Property) => {
    setForm({
      name: p.name,
      address: p.address,
      suburb: p.suburb,
      city: p.city,
      property_type: p.property_type,
      bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms),
      weekly_rent: String(p.weekly_rent),
      bond: String(p.bond),
      available_rooms: String(p.available_rooms),
      max_flatmates: String(p.max_flatmates),
      description: p.description,
      rules: p.rules.join(", "),
    });
    setEditingId(p.id);
    setShowPropertyForm(true);
  };

  const saveProperty = () => {
    if (!form.name.trim() || !form.address.trim() || !form.weekly_rent) {
      showToast("Name, address and rent are required");
      return;
    }
    const rules = form.rules
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    const payload: Property = {
      id: editingId ?? nextId(),
      name: form.name.trim(),
      address: form.address.trim(),
      suburb: form.suburb.trim() || "Tauranga",
      city: form.city.trim() || "Tauranga",
      property_type: form.property_type,
      bedrooms: parseInt(form.bedrooms, 10) || 1,
      bathrooms: parseInt(form.bathrooms, 10) || 1,
      weekly_rent: parseFloat(form.weekly_rent) || 0,
      bond: parseFloat(form.bond) || parseFloat(form.weekly_rent) * 4 || 0,
      available_rooms: parseInt(form.available_rooms, 10) || 1,
      max_flatmates: parseInt(form.max_flatmates, 10) || 2,
      flatmate_count: 0,
      description: form.description.trim() || "New Zealand rental property.",
      rules: rules.length ? rules : DEFAULT_RULES,
      image_url:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
    };
    if (editingId) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...payload, flatmate_count: p.flatmate_count } : p,
        ),
      );
      showToast("Property updated");
    } else {
      setProperties((prev) => [...prev, payload]);
      showToast("Property created");
    }
    resetForm();
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setJoinRequests((prev) => prev.filter((r) => r.property_id !== id));
    showToast("Property deleted");
  };

  const adjustRent = (id: string, delta: number) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, weekly_rent: Math.max(0, p.weekly_rent + delta) } : p,
      ),
    );
    showToast(delta > 0 ? "Rent increased by $10" : "Rent decreased by $10");
  };

  const requestJoin = (propertyId: string) => {
    setLeftFlat(false);
    const existing = myJoinRequests.find(
      (r) => r.property_id === propertyId && r.status === "pending",
    );
    if (existing) {
      showToast("Join request already pending");
      return;
    }
    setJoinRequests((prev) => [
      {
        id: nextId(),
        property_id: propertyId,
        flatmate_name: FLATMATE_USER.name,
        flatmate_email: FLATMATE_USER.email,
        message: "Hi, I'd like to join this flat please.",
        status: "pending",
        created_at: "Just now",
      },
      ...prev,
    ]);
    showToast("Join request sent");
  };

  const cancelJoinRequest = (id: string) => {
    setJoinRequests((prev) => prev.filter((r) => r.id !== id));
    showToast("Request cancelled");
  };

  const approveRequest = (id: string) => {
    const req = joinRequests.find((r) => r.id === id);
    if (!req) return;
    if (req.flatmate_name === FLATMATE_USER.name) setLeftFlat(false);
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)),
    );
    setProperties((prev) =>
      prev.map((p) =>
        p.id === req.property_id
          ? { ...p, flatmate_count: Math.min(p.flatmate_count + 1, p.max_flatmates) }
          : p,
      ),
    );
    showToast("Join request approved");
  };

  const rejectRequest = (id: string) => {
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)),
    );
    showToast("Join request rejected");
  };

  const leaveFlat = () => {
    if (approvedJoin) {
      setJoinRequests((prev) => prev.filter((r) => r.id !== approvedJoin.id));
      if (joinedProperty) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === joinedProperty.id
              ? { ...p, flatmate_count: Math.max(0, p.flatmate_count - 1) }
              : p,
          ),
        );
      }
    }
    setLeftFlat(true);
    showToast("You have left the flat");
  };

  const switchRole = (role: DemoRole) => {
    setDemoRole(role);
    setTab("home");
    setOverlay(null);
    setActiveChatId(null);
    showToast(`Switched to ${role} demo`);
  };

  const navigateTab = (t: TabId) => {
    setTab(t);
    setOverlay(null);
    setActiveChatId(null);
  };

  const openChat = (id: string) => {
    setActiveChatId(id);
    setOverlay("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)),
    );
  };

  const sendMessage = (content: string) => {
    if (!activeChatId) return;
    const msg: ChatMessage = {
      id: nextId(),
      conversation_id: activeChatId,
      sender_name: "You",
      content,
      created_at: new Date().toISOString(),
      is_mine: true,
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, last_message: content, last_time: "Just now" }
          : c,
      ),
    );
  };

  const activeConversation = conversations.find((c) => c.id === activeChatId);

  const renderMainContent = () => {
    if (overlay === "chat" && activeConversation) {
      return (
        <ChatScreen
          conversation={activeConversation}
          messages={chatMessages[activeChatId!] ?? []}
          onBack={() => {
            setOverlay(null);
            setActiveChatId(null);
          }}
          onSend={sendMessage}
        />
      );
    }

    if (demoRole === "flatmate") {
      switch (tab) {
        case "home":
          return (
            <DashboardScreen
              role="flatmate"
              rentDue={flatmateRentDue}
              nextRentDate={nextRentDate}
              flatName={joinedProperty?.name ?? null}
              maintenanceCount={MAINTENANCE_COUNT}
              unreadMessages={unreadMessages}
              upcomingBills={upcomingBills}
              monthlyIncome={0}
              propertyCount={0}
              pendingRequests={0}
              outstandingRent={0}
              onMyFlat={() => navigateTab("myflat")}
              onRent={() => navigateTab("rent")}
              onMessages={() => navigateTab("messages")}
              onProperties={() => {}}
              onRequests={() => {}}
            />
          );
        case "myflat":
          return (
            <MyFlatScreen
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchResults={searchResults}
              allProperties={properties}
              joinedProperty={joinedProperty}
              myJoinRequests={myJoinRequests}
              onRequestJoin={requestJoin}
              onCancelRequest={cancelJoinRequest}
              onLeaveFlat={leaveFlat}
            />
          );
        case "rent":
          return (
            <RentScreen
              sections={rentSections}
              onUploadReceipt={() => showToast("Receipt uploaded (mock)")}
              onDownloadLedger={() => showToast("Ledger downloaded (mock)")}
            />
          );
        case "messages":
          return (
            <MessagesScreen
              conversations={conversations}
              onOpenChat={openChat}
              isTab
            />
          );
        case "profile":
          return (
            <ProfileScreen
              role={demoRole}
              propertyCount={properties.length}
              paymentCount={rentPayments.length}
              requestCount={joinRequests.length}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onSwitchRole={switchRole}
            />
          );
        default:
          return null;
      }
    }

    switch (tab) {
      case "home":
        return (
          <DashboardScreen
            role="landlord"
            rentDue={0}
            nextRentDate={null}
            flatName={null}
            maintenanceCount={MAINTENANCE_COUNT}
            unreadMessages={unreadMessages}
            upcomingBills={0}
            monthlyIncome={monthlyIncome}
            propertyCount={properties.length}
            pendingRequests={pendingLandlordRequests.length}
            outstandingRent={rentSections.current_due_total + rentSections.overdue_total}
            onMyFlat={() => {}}
            onRent={() => navigateTab("rent")}
            onMessages={() => navigateTab("messages")}
            onProperties={() => navigateTab("properties")}
            onRequests={() => navigateTab("requests")}
          />
        );
      case "properties":
        return (
          <PropertiesScreen
            properties={properties}
            showForm={showPropertyForm}
            editing={!!editingId}
            form={form}
            onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
            onShowForm={() => {
              resetForm();
              setShowPropertyForm(true);
            }}
            onCloseForm={resetForm}
            onSave={saveProperty}
            onEdit={loadForm}
            onDelete={deleteProperty}
            onAdjustRent={adjustRent}
          />
        );
      case "requests":
        return (
          <RequestsScreen
            properties={properties}
            joinRequests={joinRequests}
            onApprove={approveRequest}
            onReject={rejectRequest}
          />
        );
      case "rent":
        return (
          <RentScreen
            sections={rentSections}
            onUploadReceipt={() => showToast("Receipt uploaded (mock)")}
            onDownloadLedger={() => showToast("Ledger downloaded (mock)")}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            role={demoRole}
            propertyCount={properties.length}
            paymentCount={rentPayments.length}
            requestCount={joinRequests.length}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSwitchRole={switchRole}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={[styles.phone, { backgroundColor: theme.bg }]} edges={["top"]}>
        {renderMainContent()}

        {toast && (
          <View style={[styles.toast, { backgroundColor: theme.success }]}>
            <Text style={styles.toastText}>✓ {toast}</Text>
          </View>
        )}

        {!overlay && (
          <BottomNavigation
            role={demoRole}
            active={tab}
            onChange={navigateTab}
            unreadMessages={unreadMessages}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as unknown as number } : {}),
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: PHONE_MAX,
  },
  toast: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    zIndex: 100,
  },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
