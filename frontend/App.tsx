import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { BottomNavigation } from "./components/BottomNavigation";
import { BrandSplash } from "./components/BrandSplash";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth, useDemoRole } from "./contexts/AuthContext";
import { AuthFlow } from "./navigation/AuthFlow";
import { CURRENT_EMERGENCY_STATUS } from "./data/mockAlerts";
import { DEMO_APPROVED_JOIN } from "./data/demoJoin";
import { EMPTY_PROPERTY_FORM } from "./data/formDefaults";
import {
  MOCK_AI_QUESTIONS,
  MOCK_CALENDAR_EVENTS,
  MOCK_CHORES,
  MOCK_EMERGENCY_CONTACTS,
  MOCK_FEED_POSTS,
  MOCK_FLATMATE_MEMBERS,
  MOCK_HOUSE_RULES,
  MOCK_MAINTENANCE,
  MOCK_NOTIFICATIONS,
  MOCK_SHARED_BILLS,
} from "./data/mockFlatData";
import {
  MOCK_AGREEMENT,
  MOCK_ANNOUNCEMENTS,
  MOCK_AVAILABILITY,
  MOCK_BOND,
  MOCK_CHECKLIST,
  MOCK_DOCUMENTS,
  MOCK_EXPENSES,
  MOCK_GALLERY,
  MOCK_HOUSE_VIBE,
  MOCK_LEASE_TIMELINE,
  MOCK_MAINTENANCE_HISTORY,
  MOCK_PROPERTY_HEALTH,
  MOCK_SHOPPING,
  MOCK_UTILITIES,
  MOCK_VISITORS,
} from "./data/mockFlatExtended";
import {
  DEFAULT_INSPECTION_DATE,
  MOCK_LANDLORD_DOCUMENTS,
  MOCK_LANDLORD_NOTIFICATIONS,
  MOCK_LANDLORD_TENANTS,
} from "./data/mockLandlord";
import { INITIAL_JOIN_REQUESTS, MOCK_CHAT_MESSAGES, MOCK_CONVERSATIONS } from "./data/mockMessages";
import { MOCK_RENT_PAYMENTS } from "./data/mockRent";
import { FLATMATE_USER } from "./data/mockUsers";
import { usePropertiesData } from "./hooks/usePropertiesData";
import { useHouseRules } from "./src/hooks/useProperties";
import { queryClient } from "./src/lib/queryClient";
import { ChatScreen } from "./screens/ChatScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { FlatFeatureRouter } from "./screens/FlatFeatureRouter";
import { MessagesScreen } from "./screens/MessagesScreen";
import { MyFlatScreen } from "./screens/MyFlatScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { PropertiesScreen } from "./screens/PropertiesScreen";
import { PropertyDetailScreen } from "./screens/PropertyDetailScreen";
import { LandlordPaymentsScreen } from "./screens/LandlordPaymentsScreen";
import { LandlordMaintenanceScreen } from "./screens/LandlordMaintenanceScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { RentScreen } from "./screens/RentScreen";
import { MaintenanceScreen } from "./screens/MaintenanceScreen";
import { TenantsScreen } from "./screens/TenantsScreen";
import { DemoRole, OverlayScreen, SubScreen, TabId } from "./types";
import { CalendarEvent, FeedPost, HouseRule, MaintenanceStatus, RuleCategory } from "./types/flat";
import { LandlordDocument, LandlordTenant } from "./types/landlord";
import { AvailabilityStatus } from "./types/flatExtended";
import { ChatMessage, Conversation } from "./types/message";
import { Property, PropertyFormData } from "./types/property";
import { JoinRequest } from "./types/request";
import { RentPayment } from "./types/rent";
import { buildRentSections, getNextRentDate, getRentDaysUntil } from "./utils/rentHelpers";
import { pickProfileImage } from "./utils/imagePicker";
import { nextId } from "./data/formDefaults";

const PHONE_MAX = 430;
const CURRENT_USER_ID = "fm1";
const ALL_MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  "submitted",
  "reviewed",
  "assigned",
  "in_progress",
  "completed",
];

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppGate />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <BrandSplash />;
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <HomeHubApp />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}

function HomeHubApp() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, switchRole: authSwitchRole } = useAuth();
  const demoRole = useDemoRole();
  const [tab, setTab] = useState<TabId>("home");
  const [subScreen, setSubScreen] = useState<SubScreen | null>(null);
  const [overlay, setOverlay] = useState<OverlayScreen>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const {
    properties,
    setProperties,
    loading: propertiesLoading,
    saving: propertiesSaving,
    error: propertiesError,
    source: propertiesSource,
    isOffline: propertiesOffline,
    myFlatProperty,
    reload: reloadProperties,
    createProperty,
    updateProperty,
    deleteProperty: removeProperty,
  } = usePropertiesData();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    DEMO_APPROVED_JOIN,
    ...INITIAL_JOIN_REQUESTS,
  ]);
  const [rentPayments] = useState<RentPayment[]>(MOCK_RENT_PAYMENTS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(MOCK_CHAT_MESSAGES);

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [houseRules, setHouseRules] = useState(MOCK_HOUSE_RULES);
  const [chores, setChores] = useState(MOCK_CHORES);
  const [bills, setBills] = useState(MOCK_SHARED_BILLS);
  const [calendarEvents, setCalendarEvents] = useState(MOCK_CALENDAR_EVENTS);
  const [maintenance, setMaintenance] = useState(MOCK_MAINTENANCE);
  const [feedPosts, setFeedPosts] = useState(MOCK_FEED_POSTS);

  const [documents] = useState(MOCK_DOCUMENTS);
  const [bond] = useState(MOCK_BOND);
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST);
  const [expenses] = useState(MOCK_EXPENSES);
  const [availability, setAvailability] = useState(MOCK_AVAILABILITY);
  const [shopping, setShopping] = useState(MOCK_SHOPPING);
  const [visitors, setVisitors] = useState(MOCK_VISITORS);
  const [utilities] = useState(MOCK_UTILITIES);
  const [leaseTimeline] = useState(MOCK_LEASE_TIMELINE);
  const [houseVibe] = useState(MOCK_HOUSE_VIBE);
  const [maintenanceHistory] = useState(MOCK_MAINTENANCE_HISTORY);
  const [gallery] = useState(MOCK_GALLERY);
  const [agreement, setAgreement] = useState(MOCK_AGREEMENT);
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [propertyHealth] = useState(MOCK_PROPERTY_HEALTH);

  const [landlordTenants, setLandlordTenants] = useState<LandlordTenant[]>(MOCK_LANDLORD_TENANTS);
  const [landlordDocuments, setLandlordDocuments] = useState<LandlordDocument[]>(MOCK_LANDLORD_DOCUMENTS);
  const [landlordNotifications, setLandlordNotifications] = useState(MOCK_LANDLORD_NOTIFICATIONS);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [propertyFormImage, setPropertyFormImage] = useState<string | null>(null);
  const [nextInspectionDate, setNextInspectionDate] = useState(DEFAULT_INSPECTION_DATE);
  const [inspectionReminder, setInspectionReminder] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormData>(EMPTY_PROPERTY_FORM);
  const [leftFlat, setLeftFlat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTab("home");
    setSubScreen(null);
    setOverlay(null);
    setActiveChatId(null);
  }, [user?.id, user?.role]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadProperties();
    setRefreshing(false);
  };

  const alertLevel =
    CURRENT_EMERGENCY_STATUS === "emergency"
      ? "emergency"
      : CURRENT_EMERGENCY_STATUS === "watch"
        ? "watch"
        : "normal";
  const alertTitle =
    alertLevel === "normal"
      ? "No active alerts"
      : alertLevel === "watch"
        ? "Weather warning in Bay of Plenty"
        : "Earthquake alert — check Civil Defence";

  const occupancyRate = useMemo(() => {
    if (!properties.length) return 0;
    const total = properties.reduce((s, p) => s + p.max_flatmates, 0);
    const filled = properties.reduce((s, p) => s + p.flatmate_count, 0);
    return total ? Math.round((filled / total) * 100) : 0;
  }, [properties]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const myJoinRequests = joinRequests.filter(
    (r) => r.flatmate_name === FLATMATE_USER.name || r.flatmate_email === FLATMATE_USER.email,
  );
  const approvedJoin = myJoinRequests.find((r) => r.status === "approved" && !leftFlat);
  const demoJoinedProperty = approvedJoin
    ? properties.find((p) => p.id === approvedJoin.property_id) ?? null
    : null;
  const joinedProperty = myFlatProperty ?? demoJoinedProperty;
  const flatHouseRulesQuery = useHouseRules(joinedProperty?.id ?? null);
  const flatHouseRules = flatHouseRulesQuery.data ?? houseRules;

  const pendingLandlordRequests = joinRequests.filter((r) => r.status === "pending");
  const rentSections = useMemo(() => buildRentSections(rentPayments), [rentPayments]);
  const nextRentDate = useMemo(() => getNextRentDate(rentPayments), [rentPayments]);
  const rentDaysUntil = useMemo(() => getRentDaysUntil(rentPayments), [rentPayments]);
  const nextRentAmount =
    rentSections.current_due[0]?.amount ?? rentSections.upcoming[0]?.amount ?? 0;

  const monthlyIncome = useMemo(
    () => properties.reduce((s, p) => s + p.weekly_rent * 4, 0),
    [properties],
  );

  const collectedThisMonth = useMemo(
    () => rentSections.paid_this_month,
    [rentSections],
  );

  const flatmateRentDue = rentSections.current_due_total + rentSections.overdue_total;
  const unreadMessages = conversations.reduce((s, c) => s + c.unread_count, 0);
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const billsDueCount = bills.filter(
    (b) => b.owes.includes(FLATMATE_USER.name) && b.status !== "paid",
  ).length;
  const choresPending = chores.filter(
    (c) => c.assigned_id === CURRENT_USER_ID && c.status !== "completed",
  ).length;
  const maintenanceActive = maintenance.filter((m) => m.status !== "completed").length;
  const documentCount = documents.length;
  const unreadAnnouncements = announcements.filter((a) => !a.read).length;
  const shoppingPending = shopping.filter((s) => !s.purchased).length;
  const upcomingVisitors = visitors.filter((v) => v.upcoming).length;

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

  const openSubScreen = (screen: SubScreen) => {
    setSubScreen(screen);
    setOverlay(null);
    setActiveChatId(null);
  };

  const closeSubScreen = () => setSubScreen(null);

  const resetForm = () => {
    setForm(EMPTY_PROPERTY_FORM);
    setEditingId(null);
    setShowPropertyForm(false);
    setPropertyFormImage(null);
  };

  const openPropertyDetail = (property: Property) => {
    setViewingProperty(property);
    setSubScreen("property-detail");
  };

  const pickPropertyPhoto = async () => {
    const picked = await pickProfileImage();
    if (picked?.uri) {
      setPropertyFormImage(picked.uri);
      showToast("Property photo selected");
    }
  };

  const scheduleInspection = () => {
    const dates = ["20 June 2026", "27 June 2026", "4 July 2026", "11 July 2026"];
    const next = dates[(dates.indexOf(nextInspectionDate) + 1) % dates.length];
    setNextInspectionDate(next);
    setInspectionReminder(true);
    showToast(`Inspection scheduled for ${next}`);
  };

  const uploadLandlordDocument = () => {
    const doc: LandlordDocument = {
      id: nextId(),
      title: "Uploaded Document",
      category: "other",
      upload_date: "13 Jun 2026",
      file_name: `Document-${Date.now()}.pdf`,
    };
    setLandlordDocuments((prev) => [doc, ...prev]);
    showToast("Document uploaded (mock)");
  };

  const removeTenant = (id: string) => {
    setLandlordTenants((prev) => prev.filter((t) => t.id !== id));
    showToast("Tenant removed");
  };

  const assignTenantRoom = (id: string, room: string) => {
    setLandlordTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, room_assigned: room } : t)),
    );
    showToast(`Room updated to ${room}`);
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    setMaintenance((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              timeline: ALL_MAINTENANCE_STATUSES.slice(
                0,
                ALL_MAINTENANCE_STATUSES.indexOf(status) + 1,
              ),
            }
          : m,
      ),
    );
    showToast(`Status updated to ${status.replace("_", " ")}`);
  };

  const assignMaintenanceContractor = (id: string, contractor: string) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, contractor, status: "assigned" as const } : m)),
    );
    showToast(`${contractor} assigned`);
  };

  const addMaintenanceNote = (id: string, note: string) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, landlord_note: note } : m)),
    );
    showToast("Note saved");
  };

  const completeMaintenance = (id: string) => {
    setMaintenance((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "completed" as const, timeline: ALL_MAINTENANCE_STATUSES }
          : m,
      ),
    );
    showToast("Maintenance marked completed");
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
    setPropertyFormImage(p.image_url);
    setEditingId(p.id);
    setShowPropertyForm(true);
  };

  const saveProperty = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.weekly_rent) {
      showToast("Name, address and rent are required");
      return;
    }
    if (editingId) {
      const existing = properties.find((p) => p.id === editingId);
      if (!existing) {
        showToast("Property not found");
        return;
      }
      const result = await updateProperty(editingId, form);
      if (propertyFormImage) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, image_url: propertyFormImage } : p,
          ),
        );
      }
      showToast(
        result.error
          ? "Saved locally (API unavailable)"
          : result.source === "api"
            ? "Property updated via API"
            : "Property updated",
      );
    } else {
      const result = await createProperty(form);
      if (propertyFormImage && result.property) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === result.property.id
              ? { ...p, image_url: propertyFormImage }
              : p,
          ),
        );
      }
      showToast(
        result.error
          ? "Saved locally (API unavailable)"
          : result.source === "api"
            ? "Property created via API"
            : "Property created",
      );
    }
    resetForm();
  };

  const deleteProperty = async (id: string) => {
    const result = await removeProperty(id);
    if (result.ok) {
      setJoinRequests((prev) => prev.filter((r) => r.property_id !== id));
      showToast(
        result.error ? "Removed locally (API unavailable)" : "Property deleted",
      );
    } else {
      showToast(result.error ?? "Could not delete property");
    }
  };

  const adjustRent = async (id: string, delta: number) => {
    const property = properties.find((p) => p.id === id);
    if (!property) return;
    const newRent = Math.max(0, property.weekly_rent + delta);
    const formFromProperty: PropertyFormData = {
      name: property.name,
      address: property.address,
      suburb: property.suburb,
      city: property.city,
      property_type: property.property_type,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      weekly_rent: String(newRent),
      bond: String(property.bond),
      available_rooms: String(property.available_rooms),
      max_flatmates: String(property.max_flatmates),
      description: property.description,
      rules: property.rules.join(", "),
    };
    const result = await updateProperty(id, formFromProperty, newRent);
    showToast(
      result.error
        ? delta > 0
          ? "Rent increased locally"
          : "Rent decreased locally"
        : delta > 0
          ? "Rent increased by $10"
          : "Rent decreased by $10",
    );
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
    const prop = properties.find((p) => p.id === req.property_id);
    setLandlordTenants((prev) => [
      ...prev,
      {
        id: nextId(),
        name: req.flatmate_name,
        email: req.flatmate_email,
        property_id: req.property_id,
        property_name: prop?.name ?? "Property",
        rent_status: "pending",
        room_assigned: "Unassigned",
      },
    ]);
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

  const switchRole = async (role: DemoRole) => {
    await authSwitchRole(role);
    showToast(`Switched to ${role} demo`);
  };

  const navigateTab = (t: TabId) => {
    setTab(t);
    setSubScreen(null);
    setOverlay(null);
    setActiveChatId(null);
  };

  const openChat = (id: string) => {
    setActiveChatId(id);
    setOverlay("chat");
    setSubScreen(null);
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
      type: "text",
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, last_message: content, last_time: "Just now" } : c,
      ),
    );
  };

  const sendImageMessage = (imageUri: string) => {
    if (!activeChatId) return;
    const msg: ChatMessage = {
      id: nextId(),
      conversation_id: activeChatId,
      sender_name: "You",
      content: "",
      created_at: new Date().toISOString(),
      is_mine: true,
      type: "image",
      image_uri: imageUri,
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, last_message: "📷 Photo", last_time: "Just now" } : c,
      ),
    );
  };

  const flatFeatureState = {
    notifications,
    flatmates: MOCK_FLATMATE_MEMBERS,
    houseRules: joinedProperty ? flatHouseRules : houseRules,
    chores,
    bills,
    calendarEvents,
    emergencyContacts: MOCK_EMERGENCY_CONTACTS,
    maintenance,
    feedPosts,
    aiQuestions: MOCK_AI_QUESTIONS,
    documents,
    bond,
    checklist,
    expenses,
    availability,
    shopping,
    visitors,
    utilities,
    leaseTimeline,
    houseVibe,
    maintenanceHistory,
    gallery,
    agreement,
    announcements,
    propertyHealth,
  };

  const flatFeatureActions = {
    onBack: closeSubScreen,
    onMarkNotificationRead: (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    onMarkAllNotificationsRead: () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("All notifications marked read");
    },
    onMessageFlatmate: (conversationId: string) => {
      closeSubScreen();
      navigateTab("messages");
      openChat(conversationId);
    },
    onViewProfile: (name: string) => showToast(`Viewing ${name}'s profile`),
    onOpenBills: () => openSubScreen("bills"),
    onAcceptRule: (id: string) => {
      setHouseRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, accepted: true } : r)),
      );
      showToast("Rule accepted");
    },
    onAcceptAllRules: () => {
      setHouseRules((prev) => prev.map((r) => ({ ...r, accepted: true })));
      showToast("All rules accepted");
    },
    onAddRule: (text: string, category: RuleCategory) => {
      const rule: HouseRule = {
        id: nextId(),
        text,
        category,
        accepted: false,
      };
      setHouseRules((prev) => [...prev, rule]);
      showToast("Rule added");
    },
    onCompleteChore: (id: string) => {
      setChores((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "completed" as const } : c)),
      );
      showToast("Chore marked complete");
    },
    onSwapChore: (id: string) => showToast("Swap request sent to flatmates"),
    onMarkBillPaid: (id: string) => {
      setBills((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "paid" as const,
                paid_by: FLATMATE_USER.name,
                owes: b.owes.filter((n) => n !== FLATMATE_USER.name),
              }
            : b,
        ),
      );
      showToast("Your share marked as paid");
    },
    onAddBill: () => {
      setBills((prev) => [
        {
          id: nextId(),
          type: "cleaning",
          label: "Cleaning Supplies",
          total_amount: 36,
          due_date: "25 Jun 2026",
          split_amount: 12,
          paid_by: "",
          owes: [FLATMATE_USER.name, "Sarah Lee", "James Patel"],
          status: "pending",
        },
        ...prev,
      ]);
      showToast("Mock bill added");
    },
    onViewBillSplit: (id: string) => {
      const bill = bills.find((b) => b.id === id);
      if (bill) showToast(`Split: ${formatCurrency(bill.split_amount)} each`);
    },
    onAddCalendarEvent: (event: CalendarEvent) => {
      setCalendarEvents((prev) => [...prev, event]);
      showToast("Event added to calendar");
    },
    onCallContact: (name: string, phone: string) =>
      showToast(`Calling ${name} at ${phone} (mock)`),
    onMessageContact: (name: string) => showToast(`Message sent to ${name} (mock)`),
    onAddMaintenance: (title: string) => {
      setMaintenance((prev) => [
        {
          id: nextId(),
          title,
          property: joinedProperty?.name ?? "My Flat",
          submitted_date: "13 Jun 2026",
          contractor: "Pending assignment",
          status: "submitted",
          expected_completion: "TBC",
          priority: "medium",
          timeline: ["submitted"],
        },
        ...prev,
      ]);
      showToast("Maintenance request submitted");
    },
    onMessageContractor: (conversationId: string) => {
      closeSubScreen();
      navigateTab("messages");
      openChat(conversationId);
    },
    onResolveMaintenance: (id: string) => {
      setMaintenance((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: "completed" as const,
                timeline: [
                  "submitted",
                  "reviewed",
                  "assigned",
                  "in_progress",
                  "completed",
                ],
              }
            : m,
        ),
      );
      showToast("Maintenance marked resolved");
    },
    onLikePost: (id: string) => {
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? p.likes - 1 : p.likes + 1,
              }
            : p,
        ),
      );
    },
    onCommentPost: (id: string) => showToast("Comment added (mock)"),
    onAddFeedPost: (content: string) => {
      const post: FeedPost = {
        id: nextId(),
        author: FLATMATE_USER.name,
        role: "Flatmate",
        timestamp: "Just now",
        content,
        type: "chore",
        likes: 0,
        liked: false,
      };
      setFeedPosts((prev) => [post, ...prev]);
      showToast("Update posted");
    },
    onDocumentAction: (action: string, name: string) =>
      showToast(`${action} ${name} (mock)`),
    onToggleChecklist: (id: string) => {
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      );
      showToast("Checklist updated");
    },
    onSetAvailability: (id: string, status: AvailabilityStatus) => {
      const notes: Record<AvailabilityStatus, string> = {
        home: "Available",
        away: "Away until Sunday",
        working: "Working nights",
        vacation: "On vacation",
      };
      setAvailability((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status, note: notes[status] } : a,
        ),
      );
      showToast("Availability updated");
    },
    onAddShoppingItem: (name: string) => {
      setShopping((prev) => [
        ...prev,
        { id: nextId(), name, purchased: false },
      ]);
      showToast("Item added to list");
    },
    onRemoveShoppingItem: (id: string) => {
      setShopping((prev) => prev.filter((s) => s.id !== id));
      showToast("Item removed");
    },
    onToggleShoppingPurchased: (id: string) => {
      setShopping((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                purchased: !s.purchased,
                purchaser: !s.purchased ? FLATMATE_USER.name : undefined,
              }
            : s,
        ),
      );
      showToast("Shopping list updated");
    },
    onAddVisitor: (name: string, overnight: boolean) => {
      setVisitors((prev) => [
        {
          id: nextId(),
          visitor_name: name,
          host: FLATMATE_USER.name,
          date: "20 Jun 2026",
          overnight,
          approved: false,
          upcoming: true,
        },
        ...prev,
      ]);
      showToast("Visitor registered");
    },
    onApproveVisitor: (id: string) => {
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, approved: true } : v)),
      );
      showToast("Visitor approved");
    },
    onAcceptAgreement: () => {
      setAgreement((prev) => ({
        ...prev,
        user_accepted: true,
        acceptances: prev.acceptances.map((a) =>
          a.name === FLATMATE_USER.name
            ? { ...a, accepted: true, date: "13 Jun 2026" }
            : a,
        ),
      }));
      showToast("Agreement accepted");
    },
    onMarkAnnouncementRead: (id: string) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
      );
    },
    onPinAnnouncement: (id: string) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)),
      );
      showToast("Announcement updated");
    },
    onAlertAction: () => showToast("Alert action completed (mock)"),
    onEmergencyCall: (name: string, phone: string) =>
      showToast(`Calling ${name} at ${phone} (mock)`),
  };

  const renderProfile = () => (
    <ProfileScreen
      role={demoRole}
      propertyCount={properties.length}
      paymentCount={rentPayments.length}
      requestCount={joinRequests.length}
      unreadNotifications={unreadNotifications}
      isDark={isDark}
      backendOffline={propertiesOffline}
      onRetryBackend={reloadProperties}
      onToggleTheme={toggleTheme}
      onSwitchRole={switchRole}
      onNavigate={openSubScreen}
      onNavigateMyFlat={() => navigateTab("myflat")}
    />
  );

  function formatCurrency(n: number) {
    return `$${n.toLocaleString("en-NZ")}`;
  }

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
          onSendImage={sendImageMessage}
        />
      );
    }

    if (subScreen === "profile") {
      return renderProfile();
    }

    if (subScreen === "property-search") {
      return (
        <PropertySearchScreen
          allProperties={properties}
          isOffline={propertiesOffline}
          onBack={closeSubScreen}
          onRequestJoin={requestJoin}
        />
      );
    }

    if (subScreen === "property-detail" && viewingProperty) {
      return (
        <PropertyDetailScreen
          property={viewingProperty}
          tenants={landlordTenants}
          documents={landlordDocuments}
          rentHistory={rentPayments}
          maintenanceHistory={maintenanceHistory}
          onBack={() => {
            setViewingProperty(null);
            closeSubScreen();
          }}
          onEdit={() => {
            loadForm(viewingProperty);
            closeSubScreen();
            navigateTab("properties");
          }}
          onUploadDocument={uploadLandlordDocument}
          onMessageTenant={(conversationId) => {
            closeSubScreen();
            openChat(conversationId);
          }}
        />
      );
    }

    if (subScreen === "landlord-notifications") {
      return (
        <NotificationsScreen
          notifications={landlordNotifications}
          onBack={closeSubScreen}
          onMarkRead={(id) => {
            setLandlordNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
            );
          }}
          onMarkAllRead={() => {
            setLandlordNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            showToast("All notifications marked read");
          }}
        />
      );
    }

    if (subScreen) {
      return (
        <FlatFeatureRouter
          screen={subScreen}
          role={demoRole}
          state={flatFeatureState}
          actions={flatFeatureActions}
          currentUserId={CURRENT_USER_ID}
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
              nextRentAmount={nextRentAmount}
              rentDaysUntil={rentDaysUntil}
              flatName={joinedProperty?.name ?? null}
              alertLevel={alertLevel}
              alertTitle={alertTitle}
              occupancyRate={0}
              maintenanceCount={maintenanceActive}
              unreadMessages={unreadMessages}
              choresPending={choresPending}
              unreadNotifications={unreadNotifications}
              notifications={notifications}
              monthlyIncome={0}
              propertyCount={0}
              pendingRequests={0}
              outstandingRent={0}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onMyFlat={() => navigateTab("myflat")}
              onRent={() => navigateTab("rent")}
              onMessages={() => navigateTab("messages")}
              onEmergency={() => openSubScreen("emergency-hub")}
              onCalendar={() => openSubScreen("calendar")}
              onAlerts={() => openSubScreen("alerts")}
              onNotifications={() => openSubScreen("notifications")}
              onProperties={() => {}}
              onTenants={() => {}}
              onPayments={() => {}}
              onMaintenance={() => openSubScreen("maintenance")}
              onProfile={() => navigateTab("profile")}
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
              nextRentDate={nextRentDate}
              nextRentAmount={nextRentAmount}
              billsDueCount={billsDueCount}
              choresPending={choresPending}
              maintenanceActive={maintenanceActive}
              documentCount={documentCount}
              unreadAnnouncements={unreadAnnouncements}
              shoppingPending={shoppingPending}
              upcomingVisitors={upcomingVisitors}
              propertiesLoading={propertiesLoading}
              propertiesError={propertiesError}
              propertiesOffline={propertiesOffline}
              houseRules={flatHouseRules}
              onRetryProperties={reloadProperties}
              onOpenPropertySearch={() => openSubScreen("property-search")}
              onRequestJoin={requestJoin}
              onCancelRequest={cancelJoinRequest}
              onLeaveFlat={leaveFlat}
              onNavigateFeature={openSubScreen}
              onNavigateTab={(tab) => {
                if (tab === "rent") navigateTab("rent");
                if (tab === "messages") navigateTab("messages");
              }}
              onMessageFlatmates={() => {
                navigateTab("messages");
                openChat("c2");
              }}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          );
        case "rent":
          return (
            <RentScreen
              sections={rentSections}
              onUploadReceipt={() => showToast("Receipt uploaded (mock)")}
              onDownloadLedger={() => showToast("Ledger downloaded (mock)")}
              onRecordPayment={() => showToast("Payment recorded (mock)")}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          );
        case "messages":
          return (
            <MessagesScreen
              conversations={conversations}
              onOpenChat={openChat}
              isTab
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          );
        case "profile":
          return renderProfile();
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
            nextRentAmount={0}
            rentDaysUntil={null}
            flatName={null}
            alertLevel={alertLevel}
            alertTitle={alertTitle}
            occupancyRate={occupancyRate}
            maintenanceCount={maintenanceActive}
            unreadMessages={unreadMessages}
            choresPending={0}
            unreadNotifications={landlordNotifications.filter((n) => !n.read).length}
            notifications={notifications}
            landlordNotifications={landlordNotifications}
            nextInspectionDate={nextInspectionDate}
            inspectionReminder={inspectionReminder}
            monthlyIncome={monthlyIncome}
            propertyCount={properties.length}
            pendingRequests={pendingLandlordRequests.length}
            outstandingRent={rentSections.current_due_total + rentSections.overdue_total}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onMyFlat={() => {}}
            onRent={() => navigateTab("payments")}
            onMessages={() => {}}
            onEmergency={() => openSubScreen("emergency-hub")}
            onCalendar={() => scheduleInspection()}
            onAlerts={() => openSubScreen("alerts")}
            onNotifications={() => openSubScreen("landlord-notifications")}
            onScheduleInspection={scheduleInspection}
            onProperties={() => navigateTab("properties")}
            onTenants={() => navigateTab("tenants")}
            onPayments={() => navigateTab("payments")}
            onMaintenance={() => navigateTab("maintenance")}
            onProfile={() => openSubScreen("profile")}
          />
        );
      case "properties":
        return (
          <PropertiesScreen
            properties={properties}
            showForm={showPropertyForm}
            editing={!!editingId}
            form={form}
            propertiesLoading={propertiesLoading}
            propertiesSaving={propertiesSaving}
            propertiesError={propertiesError}
            propertiesSource={propertiesSource}
            propertiesOffline={propertiesOffline}
            onRetryProperties={reloadProperties}
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
            onViewProperty={openPropertyDetail}
            formImageUri={propertyFormImage}
            onPickPropertyPhoto={pickPropertyPhoto}
          />
        );
      case "tenants":
        return (
          <TenantsScreen
            properties={properties}
            joinRequests={joinRequests}
            tenants={landlordTenants}
            onApprove={approveRequest}
            onReject={rejectRequest}
            onViewProperty={openPropertyDetail}
            onMessageTenant={(conversationId) => openChat(conversationId)}
            onRemoveTenant={removeTenant}
            onAssignRoom={assignTenantRoom}
          />
        );
      case "payments":
        return (
          <LandlordPaymentsScreen
            sections={rentSections}
            expectedMonthlyIncome={monthlyIncome}
            collectedThisMonth={collectedThisMonth}
            documents={landlordDocuments}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onExportReport={() => showToast("Income report exported (mock)")}
            onUploadDocument={uploadLandlordDocument}
          />
        );
      case "maintenance":
        return (
          <LandlordMaintenanceScreen
            requests={maintenance}
            onUpdateStatus={updateMaintenanceStatus}
            onAssignContractor={assignMaintenanceContractor}
            onAddNote={addMaintenanceNote}
            onMarkCompleted={completeMaintenance}
            onMessageContractor={(conversationId) => openChat(conversationId)}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        );
      default:
        return null;
    }
  };

  const hideNav = overlay !== null || subScreen !== null;

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

        {!hideNav && (
          <BottomNavigation
            role={demoRole}
            active={tab}
            onChange={navigateTab}
            unreadMessages={unreadMessages}
            unreadNotifications={
              demoRole === "landlord"
                ? landlordNotifications.filter((n) => !n.read).length
                : unreadNotifications
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  page: {
    flex: 1,
    alignItems: "center",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as unknown as number } : {}),
  },
  phone: { flex: 1, width: "100%", maxWidth: PHONE_MAX },
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
