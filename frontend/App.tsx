import { useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

/* ─── Types ─── */

type TabId = "home" | "myflat" | "landlord" | "rent" | "profile";
type OverlayScreen = "messages" | null;
type JoinStatus = "pending" | "approved" | "rejected";
type RentStatus = "paid" | "pending" | "overdue";

type Property = {
  id: string;
  name: string;
  address: string;
  suburb: string;
  city: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  weekly_rent: number;
  bond: number;
  available_rooms: number;
  max_flatmates: number;
  flatmate_count: number;
  description: string;
  rules: string[];
};

type JoinRequest = {
  id: string;
  property_id: string;
  flatmate_name: string;
  message: string;
  status: JoinStatus;
  created_at: string;
};

type RentPayment = {
  id: string;
  property_name: string;
  amount: number;
  due_date: string;
  status: RentStatus;
};

type Message = {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
};

type PropertyForm = {
  name: string;
  address: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  weekly_rent: string;
  bond: string;
  available_rooms: string;
  max_flatmates: string;
  description: string;
  rules: string;
};

/* ─── Constants ─── */

const FLATMATE_NAME = "Unikoh Gwapo";
const LANDLORD_NAME = "Aroha Williams";
const PHONE_MAX = 430;

const COLORS = {
  bg: "#060d1f",
  surface: "#0c1a2e",
  card: "#152238",
  cardGlass: "rgba(21, 34, 56, 0.88)",
  border: "#1e3a5f",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  primary: "#3b82f6",
  primaryMuted: "rgba(59, 130, 246, 0.18)",
  success: "#22c55e",
  successMuted: "rgba(34, 197, 94, 0.18)",
  warning: "#f59e0b",
  warningMuted: "rgba(245, 158, 11, 0.18)",
  danger: "#ef4444",
  dangerMuted: "rgba(239, 68, 68, 0.18)",
  purple: "#a855f7",
  white: "#ffffff",
};

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "myflat", label: "My Flat", icon: "🛏️" },
  { id: "landlord", label: "Landlord", icon: "🏢" },
  { id: "rent", label: "Rent", icon: "💰" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const DEFAULT_RULES =
  "No smoking inside, Quiet hours after 10 PM, Pay rent every Friday, Keep shared areas clean, No pets without approval, Report damage immediately, Guests must be discussed with flatmates";

const INITIAL_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Mount Maunganui Apartment",
    address: "12 Marine Parade",
    suburb: "Mount Maunganui",
    city: "Tauranga",
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 1,
    weekly_rent: 720,
    bond: 2880,
    available_rooms: 1,
    max_flatmates: 2,
    flatmate_count: 1,
    description: "Beachfront apartment with ocean views near the Mount.",
    rules: DEFAULT_RULES.split(", ").map((r) => r.trim()),
  },
  {
    id: "2",
    name: "Tauranga Townhouse",
    address: "8 Cameron Road",
    suburb: "Tauranga Central",
    city: "Tauranga",
    property_type: "Townhouse",
    bedrooms: 3,
    bathrooms: 2,
    weekly_rent: 640,
    bond: 2560,
    available_rooms: 2,
    max_flatmates: 3,
    flatmate_count: 1,
    description: "Modern townhouse close to the CBD and waterfront.",
    rules: DEFAULT_RULES.split(", ").map((r) => r.trim()),
  },
  {
    id: "3",
    name: "Papamoa Beach House",
    address: "45 Papamoa Beach Road",
    suburb: "Papamoa",
    city: "Tauranga",
    property_type: "House",
    bedrooms: 4,
    bathrooms: 2,
    weekly_rent: 850,
    bond: 3400,
    available_rooms: 2,
    max_flatmates: 4,
    flatmate_count: 2,
    description: "Spacious family home a short walk from Papamoa Beach.",
    rules: DEFAULT_RULES.split(", ").map((r) => r.trim()),
  },
];

const INITIAL_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: "jr1",
    property_id: "2",
    flatmate_name: "James Patel",
    message: "Hi, I'm a tidy tenant looking for a room near work.",
    status: "pending",
    created_at: "2 hours ago",
  },
];

const INITIAL_RENT: RentPayment[] = [
  { id: "r1", property_name: "Mount Maunganui Apartment", amount: 360, due_date: "16 Jun 2026", status: "pending" },
  { id: "r2", property_name: "Tauranga Townhouse", amount: 320, due_date: "8 Jun 2026", status: "paid" },
  { id: "r3", property_name: "Papamoa Beach House", amount: 425, due_date: "1 Jun 2026", status: "paid" },
];

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", from: "Aroha Williams", preview: "Your join request has been received.", time: "1h ago", unread: true },
  { id: "m2", from: "James Patel", preview: "Is the spare room still available?", time: "Yesterday", unread: true },
  { id: "m3", from: "HomeHub Support", preview: "Welcome to HomeHub NZ!", time: "3 days ago", unread: false },
];

const EMPTY_FORM: PropertyForm = {
  name: "",
  address: "",
  property_type: "Apartment",
  bedrooms: "2",
  bathrooms: "1",
  weekly_rent: "",
  bond: "",
  available_rooms: "1",
  max_flatmates: "2",
  description: "",
  rules: DEFAULT_RULES,
};

let uid = 100;
function nextId() {
  return String(++uid);
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-NZ")}`;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── App ─── */

export default function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [overlay, setOverlay] = useState<OverlayScreen>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(INITIAL_JOIN_REQUESTS);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>(INITIAL_RENT);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const [searchQuery, setSearchQuery] = useState("");
  const [showLandlordForm, setShowLandlordForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM);
  const [leftFlat, setLeftFlat] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const myJoinRequests = joinRequests.filter((r) => r.flatmate_name === FLATMATE_NAME);
  const approvedJoin = myJoinRequests.find((r) => r.status === "approved" && !leftFlat);
  const joinedProperty = approvedJoin
    ? properties.find((p) => p.id === approvedJoin.property_id)
    : null;

  const pendingLandlordRequests = joinRequests.filter((r) => r.status === "pending");

  const landlordStats = useMemo(() => {
    const monthlyIncome = properties.reduce((s, p) => s + p.weekly_rent * 4, 0);
    const outstanding = rentPayments
      .filter((p) => p.status !== "paid")
      .reduce((s, p) => s + p.amount, 0);
    return {
      totalProperties: properties.length,
      monthlyIncome,
      outstanding,
      pendingRequests: pendingLandlordRequests.length,
    };
  }, [properties, rentPayments, pendingLandlordRequests.length]);

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

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowLandlordForm(false);
  };

  const loadForm = (p: Property) => {
    setForm({
      name: p.name,
      address: p.address,
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
    setShowLandlordForm(true);
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
      suburb: "Tauranga",
      city: "Tauranga",
      property_type: form.property_type,
      bedrooms: parseInt(form.bedrooms, 10) || 1,
      bathrooms: parseInt(form.bathrooms, 10) || 1,
      weekly_rent: parseFloat(form.weekly_rent) || 0,
      bond: parseFloat(form.bond) || parseFloat(form.weekly_rent) * 4 || 0,
      available_rooms: parseInt(form.available_rooms, 10) || 1,
      max_flatmates: parseInt(form.max_flatmates, 10) || 2,
      flatmate_count: 0,
      description: form.description.trim() || "New Zealand rental property.",
      rules: rules.length ? rules : DEFAULT_RULES.split(", ").map((r) => r.trim()),
    };
    if (editingId) {
      setProperties((prev) =>
        prev.map((p) => (p.id === editingId ? { ...payload, flatmate_count: p.flatmate_count } : p)),
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
        flatmate_name: FLATMATE_NAME,
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
    if (req.flatmate_name === FLATMATE_NAME) setLeftFlat(false);
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as JoinStatus } : r)),
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
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as JoinStatus } : r)),
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

  const navigateTab = (t: TabId) => {
    setTab(t);
    setOverlay(null);
  };

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.phone} edges={["top"]}>
        {overlay === "messages" ? (
          <MessagesScreen
            messages={messages}
            onBack={() => setOverlay(null)}
            onOpen={(id) =>
              setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, unread: false } : m)),
              )
            }
          />
        ) : (
          <>
            {tab === "home" && (
              <DashboardScreen
                stats={landlordStats}
                unread={messages.filter((m) => m.unread).length}
                onSearchFlat={() => navigateTab("myflat")}
                onAddProperty={() => {
                  resetForm();
                  setShowLandlordForm(true);
                  navigateTab("landlord");
                }}
                onRecordRent={() => navigateTab("rent")}
                onMessages={() => setOverlay("messages")}
                onMaintenance={() => navigateTab("landlord")}
              />
            )}
            {tab === "myflat" && (
              <MyFlatScreen
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchResults={searchResults}
                joinedProperty={joinedProperty}
                myJoinRequests={myJoinRequests}
                onRequestJoin={requestJoin}
                onCancelRequest={cancelJoinRequest}
                onLeaveFlat={leaveFlat}
                hasJoined={!!joinedProperty}
              />
            )}
            {tab === "landlord" && (
              <LandlordScreen
                stats={landlordStats}
                properties={properties}
                joinRequests={joinRequests}
                showForm={showLandlordForm}
                form={form}
                editingId={editingId}
                onFormChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
                onShowForm={() => {
                  resetForm();
                  setShowLandlordForm(true);
                }}
                onHideForm={resetForm}
                onSave={saveProperty}
                onEdit={loadForm}
                onDelete={deleteProperty}
                onAdjustRent={adjustRent}
                onApprove={approveRequest}
                onReject={rejectRequest}
              />
            )}
            {tab === "rent" && <RentScreen payments={rentPayments} />}
            {tab === "profile" && (
              <ProfileScreen
                propertyCount={properties.length}
                paymentCount={rentPayments.length}
                requestCount={joinRequests.length}
              />
            )}
          </>
        )}

        {toast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ {toast}</Text>
          </View>
        )}

        {!overlay && (
          <View style={styles.tabBar}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable key={t.id} style={styles.tab} onPress={() => navigateTab(t.id)}>
                  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{t.icon}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {t.label}
                  </Text>
                  {active && <View style={styles.tabDot} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

/* ─── Dashboard ─── */

function DashboardScreen({
  stats,
  unread,
  onSearchFlat,
  onAddProperty,
  onRecordRent,
  onMessages,
  onMaintenance,
}: {
  stats: { totalProperties: number; monthlyIncome: number; outstanding: number; pendingRequests: number };
  unread: number;
  onSearchFlat: () => void;
  onAddProperty: () => void;
  onRecordRent: () => void;
  onMessages: () => void;
  onMaintenance: () => void;
}) {
  const actions = [
    { label: "Search Flat", icon: "🔍", color: COLORS.primary, onPress: onSearchFlat },
    { label: "Add Property", icon: "➕", color: COLORS.success, onPress: onAddProperty },
    { label: "Record Rent", icon: "💳", color: COLORS.warning, onPress: onRecordRent },
    { label: "Messages", icon: "💬", color: COLORS.purple, onPress: onMessages },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={styles.dashHeader}>
        <View>
          <Text style={styles.brand}>HomeHub NZ</Text>
          <Text style={styles.greeting}>Kia ora, Unikoh</Text>
        </View>
        <Pressable style={styles.bellBtn} onPress={onMessages}>
          <Text style={styles.bellIcon}>🔔</Text>
          {unread > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unread}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureTop}>
          <View>
            <Text style={styles.featureLabel}>Rent Due</Text>
            <Text style={styles.featureValue}>{formatCurrency(stats.outstanding)}</Text>
            <Text style={styles.featureSub}>Across your portfolio</Text>
          </View>
          <View style={styles.successPill}>
            <Text style={styles.successPillText}>On track</Text>
          </View>
        </View>
        <Pressable style={styles.primaryBtn} onPress={onRecordRent}>
          <Text style={styles.primaryBtnText}>Record Payment →</Text>
        </Pressable>
      </View>

      <View style={styles.statRow}>
        <StatBox label="Properties" value={String(stats.totalProperties)} icon="🏢" onPress={onAddProperty} />
        <StatBox label="Maintenance" value="4" icon="🔧" badge onPress={onMaintenance} />
        <StatBox label="Messages" value={String(unread)} icon="💬" onPress={onMessages} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        {actions.map((a) => (
          <Pressable key={a.label} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]} onPress={a.onPress}>
            <View style={[styles.actionIcon, { backgroundColor: a.color + "22" }]}>
              <Text style={styles.actionEmoji}>{a.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Card>
        <ActivityRow icon="🔔" title="Rent reminder sent" sub="Mount Maunganui · $720" time="2h ago" color={COLORS.success} />
        <ActivityRow icon="🔧" title="Maintenance updated" sub="Heat pump repair assigned" time="Yesterday" color={COLORS.warning} border />
        <ActivityRow icon="💬" title="New message" sub="Aroha Williams" time="Yesterday" color={COLORS.primary} />
      </Card>
    </ScrollView>
  );
}

/* ─── My Flat ─── */

function MyFlatScreen({
  searchQuery,
  onSearchChange,
  searchResults,
  joinedProperty,
  myJoinRequests,
  onRequestJoin,
  onCancelRequest,
  onLeaveFlat,
  hasJoined,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  searchResults: Property[];
  joinedProperty: Property | null | undefined;
  myJoinRequests: JoinRequest[];
  onRequestJoin: (id: string) => void;
  onCancelRequest: (id: string) => void;
  onLeaveFlat: () => void;
  hasJoined: boolean;
}) {
  const pendingFor = (propertyId: string) =>
    myJoinRequests.find((r) => r.property_id === propertyId && r.status === "pending");

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.screenHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>UG</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.screenTitle}>My Flat</Text>
          <Text style={styles.screenName}>{FLATMATE_NAME}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>Flatmate</Text>
          </View>
        </View>
      </View>

      <Card style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <Text style={styles.statusValue}>
          {hasJoined && joinedProperty
            ? `Connected to ${joinedProperty.name}`
            : "No flat joined yet"}
        </Text>
      </Card>

      {hasJoined && joinedProperty ? (
        <>
          <Text style={styles.sectionTitle}>My Joined Flat</Text>
          <Card elevated>
            <Text style={styles.propName}>{joinedProperty.name}</Text>
            <Text style={styles.propAddress}>
              {joinedProperty.address}, {joinedProperty.suburb}
            </Text>
            <View style={styles.detailGrid}>
              <DetailChip label="Weekly Rent" value={formatCurrency(joinedProperty.weekly_rent)} />
              <DetailChip
                label="My Share"
                value={formatCurrency(Math.round(joinedProperty.weekly_rent / joinedProperty.max_flatmates))}
              />
              <DetailChip label="Bond" value={formatCurrency(joinedProperty.bond)} />
              <DetailChip label="Due" value="Friday" />
            </View>
            <Text style={styles.subSection}>Flatmates</Text>
            {["You (Unikoh Gwapo)", "Aroha Ngata", "Mia Thompson"].slice(0, joinedProperty.flatmate_count + 1).map((name) => (
              <View key={name} style={styles.flatmateRow}>
                <View style={styles.miniAvatar}>
                  <Text style={styles.miniAvatarText}>{name.charAt(0)}</Text>
                </View>
                <Text style={styles.flatmateName}>{name}</Text>
              </View>
            ))}
            <RulesList rules={joinedProperty.rules} />
            <Pressable style={styles.dangerBtn} onPress={onLeaveFlat}>
              <Text style={styles.dangerBtnText}>Leave Flat</Text>
            </Pressable>
          </Card>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Search Flat</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search by flat name or address"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {searchResults.map((p) => {
            const pending = pendingFor(p.id);
            return (
              <Card key={p.id} style={styles.searchCard}>
                <Text style={styles.propName}>{p.name}</Text>
                <Text style={styles.propAddress}>
                  {p.address}, {p.suburb}, {p.city}
                </Text>
                <View style={styles.metaRow}>
                  <MetaTag text={`${formatCurrency(p.weekly_rent)}/wk`} />
                  <MetaTag text={`Bond ${formatCurrency(p.bond)}`} />
                  <MetaTag text={`${p.bedrooms} bed`} />
                  <MetaTag text={`${p.bathrooms} bath`} />
                </View>
                <Text style={styles.metaLine}>
                  {p.flatmate_count}/{p.max_flatmates} flatmates · {p.available_rooms} rooms available
                </Text>
                <RulesList rules={p.rules} compact />
                {pending ? (
                  <View style={styles.pendingBanner}>
                    <Text style={styles.pendingText}>⏳ Join request pending</Text>
                  </View>
                ) : (
                  <Pressable style={styles.primaryBtn} onPress={() => onRequestJoin(p.id)}>
                    <Text style={styles.primaryBtnText}>Request to Join Flat</Text>
                  </Pressable>
                )}
              </Card>
            );
          })}
        </>
      )}

      {myJoinRequests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>My Join Requests</Text>
          {myJoinRequests.map((r) => {
            const prop = searchResults.find((p) => p.id === r.property_id) ?? INITIAL_PROPERTIES.find((p) => p.id === r.property_id);
            const tone =
              r.status === "approved"
                ? COLORS.success
                : r.status === "rejected"
                  ? COLORS.danger
                  : COLORS.warning;
            return (
              <Card key={r.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <Text style={styles.propName}>{prop?.name ?? "Property"}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: tone + "22" }]}>
                    <Text style={[styles.statusBadgeText, { color: tone }]}>
                      {titleCase(r.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.requestTime}>{r.created_at}</Text>
                {r.status === "pending" && (
                  <Pressable style={styles.ghostBtn} onPress={() => onCancelRequest(r.id)}>
                    <Text style={styles.ghostBtnText}>Cancel Request</Text>
                  </Pressable>
                )}
              </Card>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

/* ─── Landlord Portal ─── */

function LandlordScreen({
  stats,
  properties,
  joinRequests,
  showForm,
  form,
  editingId,
  onFormChange,
  onShowForm,
  onHideForm,
  onSave,
  onEdit,
  onDelete,
  onAdjustRent,
  onApprove,
  onReject,
}: {
  stats: {
    totalProperties: number;
    monthlyIncome: number;
    outstanding: number;
    pendingRequests: number;
  };
  properties: Property[];
  joinRequests: JoinRequest[];
  showForm: boolean;
  form: PropertyForm;
  editingId: string | null;
  onFormChange: (k: keyof PropertyForm, v: string) => void;
  onShowForm: () => void;
  onHideForm: () => void;
  onSave: () => void;
  onEdit: (p: Property) => void;
  onDelete: (id: string) => void;
  onAdjustRent: (id: string, delta: number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const pending = joinRequests.filter((r) => r.status === "pending");

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollPad}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.screenHeader}>
          <View style={[styles.avatar, { backgroundColor: COLORS.success }]}>
            <Text style={styles.avatarText}>AW</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.screenTitle}>Landlord Portal</Text>
            <Text style={styles.screenName}>{LANDLORD_NAME}</Text>
            <View style={[styles.rolePill, { backgroundColor: COLORS.successMuted }]}>
              <Text style={[styles.rolePillText, { color: COLORS.success }]}>Landlord</Text>
            </View>
          </View>
        </View>

        <View style={styles.landlordStats}>
          <MiniStat label="Properties" value={String(stats.totalProperties)} />
          <MiniStat label="Monthly" value={formatCurrency(stats.monthlyIncome)} />
          <MiniStat label="Outstanding" value={formatCurrency(stats.outstanding)} />
          <MiniStat label="Requests" value={String(stats.pendingRequests)} highlight />
        </View>

        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Join Requests</Text>
            {pending.map((r) => {
              const prop = properties.find((p) => p.id === r.property_id);
              return (
                <Card key={r.id} style={styles.requestCard}>
                  <Text style={styles.propName}>{r.flatmate_name}</Text>
                  <Text style={styles.propAddress}>
                    Wants to join: {prop?.name ?? "Unknown"}
                  </Text>
                  <Text style={styles.requestMsg}>{r.message}</Text>
                  <View style={styles.requestActions}>
                    <Pressable style={styles.approveBtn} onPress={() => onApprove(r.id)}>
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </Pressable>
                    <Pressable style={styles.rejectBtn} onPress={() => onReject(r.id)}>
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Properties</Text>
          <Pressable style={styles.addChip} onPress={onShowForm}>
            <Text style={styles.addChipText}>+ Create</Text>
          </Pressable>
        </View>

        {showForm && (
          <Card elevated style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? "Edit Property" : "Create Property"}
            </Text>
            <FormInput label="Property Name" value={form.name} onChange={(v) => onFormChange("name", v)} placeholder="Mount Maunganui Apartment" />
            <FormInput label="Address" value={form.address} onChange={(v) => onFormChange("address", v)} placeholder="12 Marine Parade" />
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <FormInput label="Type" value={form.property_type} onChange={(v) => onFormChange("property_type", v)} placeholder="Apartment" />
              </View>
              <View style={styles.formHalf}>
                <FormInput label="Bedrooms" value={form.bedrooms} onChange={(v) => onFormChange("bedrooms", v)} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <FormInput label="Bathrooms" value={form.bathrooms} onChange={(v) => onFormChange("bathrooms", v)} keyboardType="numeric" />
              </View>
              <View style={styles.formHalf}>
                <FormInput label="Weekly Rent ($)" value={form.weekly_rent} onChange={(v) => onFormChange("weekly_rent", v)} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <FormInput label="Bond ($)" value={form.bond} onChange={(v) => onFormChange("bond", v)} keyboardType="numeric" />
              </View>
              <View style={styles.formHalf}>
                <FormInput label="Available Rooms" value={form.available_rooms} onChange={(v) => onFormChange("available_rooms", v)} keyboardType="numeric" />
              </View>
            </View>
            <FormInput label="Max Flatmates" value={form.max_flatmates} onChange={(v) => onFormChange("max_flatmates", v)} keyboardType="numeric" />
            <FormInput label="Description" value={form.description} onChange={(v) => onFormChange("description", v)} multiline placeholder="Describe the property..." />
            <FormInput
              label="Rules & Conditions (comma-separated)"
              value={form.rules}
              onChange={(v) => onFormChange("rules", v)}
              multiline
              placeholder={DEFAULT_RULES}
            />
            <Pressable style={styles.primaryBtn} onPress={onSave}>
              <Text style={styles.primaryBtnText}>
                {editingId ? "Update Property" : "Create Property"}
              </Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} onPress={onHideForm}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
          </Card>
        )}

        {properties.map((p) => (
          <Card key={p.id} style={styles.landlordCard}>
            <View style={styles.landlordCardTop}>
              <View style={styles.flex}>
                <Text style={styles.propName}>{p.name}</Text>
                <Text style={styles.propAddress}>
                  {p.address}, {p.suburb}
                </Text>
              </View>
              <Text style={styles.rentBig}>{formatCurrency(p.weekly_rent)}/wk</Text>
            </View>

            <View style={styles.metaRow}>
              <MetaTag text={`Bond ${formatCurrency(p.bond)}`} />
              <MetaTag text={`${p.flatmate_count}/${p.max_flatmates} flatmates`} />
              <MetaTag text={`~${formatCurrency(p.weekly_rent * 4)}/mo`} />
            </View>

            <View style={styles.rentControls}>
              <Pressable style={styles.rentBtn} onPress={() => onAdjustRent(p.id, -10)}>
                <Text style={styles.rentBtnText}>−$10 Rent</Text>
              </Pressable>
              <Text style={styles.rentCurrent}>{formatCurrency(p.weekly_rent)}/wk</Text>
              <Pressable style={styles.rentBtn} onPress={() => onAdjustRent(p.id, 10)}>
                <Text style={styles.rentBtnText}>+$10 Rent</Text>
              </Pressable>
            </View>

            <RulesList rules={p.rules} />

            <View style={styles.cardActions}>
              <Pressable style={styles.editBtn} onPress={() => onEdit(p)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => onDelete(p.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ─── Rent ─── */

function RentScreen({ payments }: { payments: RentPayment[] }) {
  const due = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Rent Tracker</Text>
      <Text style={styles.pageSub}>Payments across your flats</Text>

      <View style={styles.rentSummary}>
        <SummaryBox label="Total Due" value={formatCurrency(due)} color={COLORS.warning} />
        <SummaryBox label="Paid" value={formatCurrency(paid)} color={COLORS.success} />
        <SummaryBox label="Overdue" value={formatCurrency(overdue)} color={COLORS.danger} />
      </View>

      <Text style={styles.sectionTitle}>Payment History</Text>
      {payments.map((p) => {
        const tone =
          p.status === "paid" ? COLORS.success : p.status === "overdue" ? COLORS.danger : COLORS.warning;
        return (
          <Card key={p.id} style={styles.rentRow}>
            <View style={[styles.rentRowIcon, { backgroundColor: tone + "22" }]}>
              <Text>💰</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.propName}>{p.property_name}</Text>
              <Text style={styles.propAddress}>Due {p.due_date}</Text>
            </View>
            <View style={styles.rentRowRight}>
              <Text style={styles.rentAmount}>{formatCurrency(p.amount)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: tone + "22" }]}>
                <Text style={[styles.statusBadgeText, { color: tone }]}>
                  {titleCase(p.status)}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

/* ─── Messages ─── */

function MessagesScreen({
  messages,
  onBack,
  onOpen,
}: {
  messages: Message[];
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.overlayHeader}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.overlayTitle}>Messages</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {messages.map((m) => (
          <Pressable key={m.id} style={styles.messageCard} onPress={() => onOpen(m.id)}>
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{m.from.charAt(0)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={[styles.messageFrom, m.unread && styles.unread]}>{m.from}</Text>
              <Text style={styles.messagePreview} numberOfLines={2}>{m.preview}</Text>
            </View>
            <Text style={styles.messageTime}>{m.time}</Text>
            {m.unread && <View style={styles.unreadDot} />}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/* ─── Profile ─── */

function ProfileScreen({
  propertyCount,
  paymentCount,
  requestCount,
}: {
  propertyCount: number;
  paymentCount: number;
  requestCount: number;
}) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Profile</Text>
      <Card elevated style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>UG</Text>
        </View>
        <Text style={styles.profileName}>{FLATMATE_NAME}</Text>
        <Text style={styles.profileEmail}>unikoh@homehub.co.nz</Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>Flatmate · Tauranga</Text>
        </View>
      </Card>
      <View style={styles.profileStats}>
        <MiniStat label="Properties" value={String(propertyCount)} />
        <MiniStat label="Payments" value={String(paymentCount)} />
        <MiniStat label="Requests" value={String(requestCount)} />
      </View>
      <Card padded={false}>
        {["Notifications", "Payment Methods", "Documents", "Help & Support"].map((item, i, arr) => (
          <View key={item} style={[styles.menuItem, i < arr.length - 1 && styles.menuBorder]}>
            <Text style={styles.menuText}>{item}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

/* ─── Shared UI ─── */

function Card({
  children,
  elevated,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  elevated?: boolean;
  style?: object;
  padded?: boolean;
}) {
  return (
    <View style={[styles.card, elevated && styles.cardElevated, !padded && styles.cardNoPad, style]}>
      {children}
    </View>
  );
}

function StatBox({ label, value, icon, badge, onPress }: { label: string; value: string; icon: string; badge?: boolean; onPress?: () => void }) {
  const content = (
    <>
      <View style={styles.statTop}>
        <Text style={styles.statIcon}>{icon}</Text>
        {badge && <View style={styles.alertDot} />}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </>
  );
  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [styles.statBox, pressed && styles.pressed]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.statBox}>{content}</View>;
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.miniStat, highlight && styles.miniStatHighlight]}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function SummaryBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.summaryBox, { borderLeftColor: color }]}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailChip}>
      <Text style={styles.detailChipLabel}>{label}</Text>
      <Text style={styles.detailChipValue}>{value}</Text>
    </View>
  );
}

function MetaTag({ text }: { text: string }) {
  return (
    <View style={styles.metaTag}>
      <Text style={styles.metaTagText}>{text}</Text>
    </View>
  );
}

function RulesList({ rules, compact }: { rules: string[]; compact?: boolean }) {
  return (
    <View style={compact ? styles.rulesCompact : styles.rulesBlock}>
      <Text style={styles.rulesTitle}>Rules & Conditions</Text>
      {rules.map((rule) => (
        <Text key={rule} style={styles.ruleItem}>• {rule}</Text>
      ))}
    </View>
  );
}

function ActivityRow({ icon, title, sub, time, color, border }: { icon: string; title: string; sub: string; time: string; color: string; border?: boolean }) {
  return (
    <View style={[styles.activityRow, border && styles.activityBorder]}>
      <View style={[styles.activityIcon, { backgroundColor: color + "22" }]}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySub}>{sub}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: PHONE_MAX,
    backgroundColor: COLORS.surface,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollPad: { paddingHorizontal: 20, paddingBottom: 24 },

  dashHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  brand: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  greeting: { color: COLORS.text, fontSize: 22, fontWeight: "800", marginTop: 4 },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: { fontSize: 20 },
  bellBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: "700" },

  screenHeader: { flexDirection: "row", gap: 14, paddingVertical: 16, alignItems: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  screenTitle: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  screenName: { color: COLORS.textSecondary, fontSize: 15, marginTop: 2 },
  rolePill: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  rolePillText: { color: COLORS.primary, fontSize: 12, fontWeight: "700" },

  pageTitle: { color: COLORS.text, fontSize: 26, fontWeight: "800", paddingTop: 16 },
  pageSub: { color: COLORS.textMuted, fontSize: 14, marginBottom: 16 },

  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 14,
  },
  cardElevated: { backgroundColor: COLORS.card },
  cardNoPad: { padding: 0, overflow: "hidden" },

  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  featureTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  featureLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6 },
  featureValue: { color: COLORS.text, fontSize: 36, fontWeight: "800", marginTop: 4 },
  featureSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  successPill: { backgroundColor: COLORS.successMuted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  successPillText: { color: COLORS.success, fontSize: 12, fontWeight: "700" },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  dangerBtn: {
    backgroundColor: COLORS.dangerMuted,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  dangerBtnText: { color: COLORS.danger, fontSize: 15, fontWeight: "700" },
  ghostBtn: { paddingVertical: 12, alignItems: "center", marginTop: 8 },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },

  statRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  statTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  statIcon: { fontSize: 20 },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  statLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", marginTop: 2 },

  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "700", marginBottom: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addChip: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  addChipText: { color: COLORS.primary, fontSize: 13, fontWeight: "700" },

  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  actionCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  actionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionEmoji: { fontSize: 20 },
  actionLabel: { color: COLORS.text, fontSize: 13, fontWeight: "600" },

  activityRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  activityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityTitle: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  activitySub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  activityTime: { color: COLORS.textMuted, fontSize: 11 },

  statusCard: { marginBottom: 16 },
  statusLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  statusValue: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginTop: 6 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 14 },

  searchCard: { marginBottom: 14 },
  propName: { color: COLORS.text, fontSize: 17, fontWeight: "700" },
  propAddress: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  metaTag: { backgroundColor: COLORS.primaryMuted, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  metaTagText: { color: COLORS.primary, fontSize: 11, fontWeight: "600" },
  metaLine: { color: COLORS.textMuted, fontSize: 12, marginTop: 8 },

  pendingBanner: {
    backgroundColor: COLORS.warningMuted,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  pendingText: { color: COLORS.warning, fontSize: 14, fontWeight: "700" },

  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  detailChip: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailChipLabel: { color: COLORS.textMuted, fontSize: 11 },
  detailChipValue: { color: COLORS.text, fontSize: 15, fontWeight: "700", marginTop: 2 },

  subSection: { color: COLORS.text, fontSize: 15, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  flatmateRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  miniAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryMuted, alignItems: "center", justifyContent: "center" },
  miniAvatarText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  flatmateName: { color: COLORS.textSecondary, fontSize: 14 },

  rulesBlock: { marginTop: 14 },
  rulesCompact: { marginTop: 10 },
  rulesTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  ruleItem: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 2 },

  requestCard: { marginBottom: 12 },
  requestTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  requestTime: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  requestMsg: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 18 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  requestActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: COLORS.success, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  approveBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  rejectBtn: { flex: 1, backgroundColor: COLORS.dangerMuted, borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.danger },
  rejectBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: "700" },

  landlordStats: { flexDirection: "row", gap: 8, marginBottom: 16 },
  miniStat: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: "center",
  },
  miniStatHighlight: { borderColor: COLORS.warning },
  miniStatValue: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  miniStatLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },

  formCard: { marginBottom: 16 },
  formTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginBottom: 14 },
  formRow: { flexDirection: "row", gap: 10 },
  formHalf: { flex: 1 },
  field: { marginBottom: 12 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 6 },
  fieldInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  fieldMultiline: { minHeight: 80, textAlignVertical: "top" },

  landlordCard: { marginBottom: 14 },
  landlordCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  rentBig: { color: COLORS.success, fontSize: 18, fontWeight: "800" },
  rentControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 },
  rentBtn: { backgroundColor: COLORS.primaryMuted, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  rentBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: "700" },
  rentCurrent: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  editBtn: { flex: 1, backgroundColor: COLORS.primaryMuted, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  editBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  deleteBtn: { flex: 1, backgroundColor: COLORS.dangerMuted, borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.danger },
  deleteBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: "700" },

  rentSummary: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: COLORS.border,
    padding: 12,
  },
  summaryValue: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },

  rentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rentRowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rentRowRight: { alignItems: "flex-end", gap: 4 },
  rentAmount: { color: COLORS.text, fontSize: 16, fontWeight: "800" },

  overlayHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  backBtnText: { color: COLORS.primary, fontSize: 20, fontWeight: "600" },
  overlayTitle: { flex: 1, textAlign: "center", color: COLORS.text, fontSize: 17, fontWeight: "700" },

  messageCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 10 },
  messageAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  messageAvatarText: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  messageFrom: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "600" },
  unread: { color: COLORS.text, fontWeight: "800" },
  messagePreview: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  messageTime: { color: COLORS.textMuted, fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },

  profileCard: { alignItems: "center" },
  avatarLarge: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  avatarLargeText: { color: COLORS.white, fontSize: 26, fontWeight: "800" },
  profileName: { color: COLORS.text, fontSize: 22, fontWeight: "800", marginTop: 12 },
  profileEmail: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  profileStats: { flexDirection: "row", gap: 10, marginBottom: 16 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { color: COLORS.text, fontSize: 15 },
  menuChevron: { color: COLORS.textMuted, fontSize: 20 },

  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: COLORS.successMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.success,
    padding: 14,
    alignItems: "center",
  },
  toastText: { color: COLORS.success, fontSize: 14, fontWeight: "600" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 4 },
  tabIcon: { fontSize: 20, opacity: 0.45 },
  tabIconActive: { opacity: 1 },
  tabLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: "600", marginTop: 2 },
  tabLabelActive: { color: COLORS.primary },
  tabDot: { position: "absolute", top: 0, width: 18, height: 3, borderRadius: 2, backgroundColor: COLORS.primary },
});
