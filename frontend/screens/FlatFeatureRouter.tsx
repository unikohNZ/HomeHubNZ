import { AIAssistantScreen } from "./AIAssistantScreen";
import { AgreementScreen } from "./AgreementScreen";
import { AnnouncementsScreen } from "./AnnouncementsScreen";
import { AvailabilityScreen } from "./AvailabilityScreen";
import { BillsScreen } from "./BillsScreen";
import { BondTrackerScreen } from "./BondTrackerScreen";
import { CalendarScreen } from "./CalendarScreen";
import { ChecklistsScreen } from "./ChecklistsScreen";
import { ChoresScreen } from "./ChoresScreen";
import { DocumentsScreen } from "./DocumentsScreen";
import { EmergencyContactsScreen } from "./EmergencyContactsScreen";
import { ExpensesScreen } from "./ExpensesScreen";
import { FlatFeedScreen } from "./FlatFeedScreen";
import { FlatmatesScreen } from "./FlatmatesScreen";
import { GalleryScreen } from "./GalleryScreen";
import { HouseRulesScreen } from "./HouseRulesScreen";
import { HouseVibeScreen } from "./HouseVibeScreen";
import { LeaseTimelineScreen } from "./LeaseTimelineScreen";
import { MaintenanceHistoryScreen } from "./MaintenanceHistoryScreen";
import { MaintenanceScreen } from "./MaintenanceScreen";
import { NotificationsScreen } from "./NotificationsScreen";
import { PropertyHealthScreen } from "./PropertyHealthScreen";
import { ShoppingListScreen } from "./ShoppingListScreen";
import { UtilityAnalyticsScreen } from "./UtilityAnalyticsScreen";
import { VisitorsScreen } from "./VisitorsScreen";
import {
  AIQuickQuestion,
  AppNotification,
  CalendarEvent,
  Chore,
  EmergencyContact,
  FeedPost,
  FlatmateMember,
  HouseRule,
  MaintenanceRequest,
  RuleCategory,
  SharedBill,
} from "../types/flat";
import {
  Announcement,
  AvailabilityStatus,
  BondTracker,
  ChecklistItem,
  FlatAgreement,
  FlatDocument,
  FlatmateAvailability,
  GalleryImage,
  HouseVibe,
  LeaseTimeline,
  MaintenanceHistoryItem,
  MonthlyExpense,
  PropertyHealth,
  ShoppingItem,
  UtilityUsage,
  VisitorEntry,
} from "../types/flatExtended";
import { DemoRole, SubScreen } from "../types";

export interface FlatFeatureState {
  notifications: AppNotification[];
  flatmates: FlatmateMember[];
  houseRules: HouseRule[];
  chores: Chore[];
  bills: SharedBill[];
  calendarEvents: CalendarEvent[];
  emergencyContacts: EmergencyContact[];
  maintenance: MaintenanceRequest[];
  feedPosts: FeedPost[];
  aiQuestions: AIQuickQuestion[];
  documents: FlatDocument[];
  bond: BondTracker;
  checklist: ChecklistItem[];
  expenses: MonthlyExpense[];
  availability: FlatmateAvailability[];
  shopping: ShoppingItem[];
  visitors: VisitorEntry[];
  utilities: UtilityUsage[];
  leaseTimeline: LeaseTimeline;
  houseVibe: HouseVibe;
  maintenanceHistory: MaintenanceHistoryItem[];
  gallery: GalleryImage[];
  agreement: FlatAgreement;
  announcements: Announcement[];
  propertyHealth: PropertyHealth;
}

export interface FlatFeatureActions {
  onBack: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onMessageFlatmate: (conversationId: string) => void;
  onViewProfile: (name: string) => void;
  onOpenBills: () => void;
  onAcceptRule: (id: string) => void;
  onAcceptAllRules: () => void;
  onAddRule: (text: string, category: RuleCategory) => void;
  onCompleteChore: (id: string) => void;
  onSwapChore: (id: string) => void;
  onMarkBillPaid: (id: string) => void;
  onAddBill: () => void;
  onViewBillSplit: (id: string) => void;
  onAddCalendarEvent: (event: CalendarEvent) => void;
  onCallContact: (name: string, phone: string) => void;
  onMessageContact: (name: string) => void;
  onAddMaintenance: (title: string) => void;
  onMessageContractor: (conversationId: string) => void;
  onResolveMaintenance: (id: string) => void;
  onLikePost: (id: string) => void;
  onCommentPost: (id: string) => void;
  onAddFeedPost: (content: string) => void;
  onDocumentAction: (action: string, name: string) => void;
  onToggleChecklist: (id: string) => void;
  onSetAvailability: (id: string, status: AvailabilityStatus) => void;
  onAddShoppingItem: (name: string) => void;
  onRemoveShoppingItem: (id: string) => void;
  onToggleShoppingPurchased: (id: string) => void;
  onAddVisitor: (name: string, overnight: boolean) => void;
  onApproveVisitor: (id: string) => void;
  onAcceptAgreement: () => void;
  onMarkAnnouncementRead: (id: string) => void;
  onPinAnnouncement: (id: string) => void;
}

interface FlatFeatureRouterProps {
  screen: SubScreen;
  role: DemoRole;
  state: FlatFeatureState;
  actions: FlatFeatureActions;
  currentUserId: string;
}

export function FlatFeatureRouter({
  screen,
  role,
  state,
  actions,
  currentUserId,
}: FlatFeatureRouterProps) {
  switch (screen) {
    case "notifications":
      return (
        <NotificationsScreen
          notifications={state.notifications}
          onBack={actions.onBack}
          onMarkRead={actions.onMarkNotificationRead}
          onMarkAllRead={actions.onMarkAllNotificationsRead}
        />
      );
    case "flatmates":
      return (
        <FlatmatesScreen
          flatmates={state.flatmates}
          currentUserId={currentUserId}
          onBack={actions.onBack}
          onMessage={actions.onMessageFlatmate}
          onViewProfile={actions.onViewProfile}
          onSplitBill={actions.onOpenBills}
        />
      );
    case "house-rules":
      return (
        <HouseRulesScreen
          rules={state.houseRules}
          role={role}
          onBack={actions.onBack}
          onAccept={actions.onAcceptRule}
          onAcceptAll={actions.onAcceptAllRules}
          onAddRule={actions.onAddRule}
        />
      );
    case "chores":
      return (
        <ChoresScreen
          chores={state.chores}
          currentUserId={currentUserId}
          onBack={actions.onBack}
          onComplete={actions.onCompleteChore}
          onRequestSwap={actions.onSwapChore}
        />
      );
    case "bills":
      return (
        <BillsScreen
          bills={state.bills}
          onBack={actions.onBack}
          onMarkPaid={actions.onMarkBillPaid}
          onAddBill={actions.onAddBill}
          onViewSplit={actions.onViewBillSplit}
        />
      );
    case "calendar":
      return (
        <CalendarScreen
          events={state.calendarEvents}
          onBack={actions.onBack}
          onAddEvent={actions.onAddCalendarEvent}
        />
      );
    case "emergency":
      return (
        <EmergencyContactsScreen
          contacts={state.emergencyContacts}
          onBack={actions.onBack}
          onCall={actions.onCallContact}
          onMessage={actions.onMessageContact}
        />
      );
    case "maintenance":
      return (
        <MaintenanceScreen
          requests={state.maintenance}
          onBack={actions.onBack}
          onAdd={actions.onAddMaintenance}
          onMessageContractor={actions.onMessageContractor}
          onResolve={actions.onResolveMaintenance}
        />
      );
    case "flat-feed":
      return (
        <FlatFeedScreen
          posts={state.feedPosts}
          onBack={actions.onBack}
          onLike={actions.onLikePost}
          onComment={actions.onCommentPost}
          onAddPost={actions.onAddFeedPost}
        />
      );
    case "ai-assistant":
      return (
        <AIAssistantScreen
          quickQuestions={state.aiQuestions}
          onBack={actions.onBack}
        />
      );
    case "documents":
      return (
        <DocumentsScreen
          documents={state.documents}
          onBack={actions.onBack}
          onAction={actions.onDocumentAction}
        />
      );
    case "bond-tracker":
      return <BondTrackerScreen bond={state.bond} onBack={actions.onBack} />;
    case "checklists":
      return (
        <ChecklistsScreen
          items={state.checklist}
          onBack={actions.onBack}
          onToggle={actions.onToggleChecklist}
        />
      );
    case "expenses":
      return (
        <ExpensesScreen
          expenses={state.expenses}
          onBack={actions.onBack}
        />
      );
    case "availability":
      return (
        <AvailabilityScreen
          availability={state.availability}
          onBack={actions.onBack}
          onSetStatus={actions.onSetAvailability}
        />
      );
    case "shopping-list":
      return (
        <ShoppingListScreen
          items={state.shopping}
          onBack={actions.onBack}
          onAdd={actions.onAddShoppingItem}
          onRemove={actions.onRemoveShoppingItem}
          onTogglePurchased={actions.onToggleShoppingPurchased}
        />
      );
    case "visitors":
      return (
        <VisitorsScreen
          visitors={state.visitors}
          onBack={actions.onBack}
          onAdd={actions.onAddVisitor}
          onApprove={actions.onApproveVisitor}
        />
      );
    case "utility-analytics":
      return (
        <UtilityAnalyticsScreen
          utilities={state.utilities}
          onBack={actions.onBack}
        />
      );
    case "lease-timeline":
      return (
        <LeaseTimelineScreen
          lease={state.leaseTimeline}
          onBack={actions.onBack}
        />
      );
    case "house-vibe":
      return <HouseVibeScreen vibe={state.houseVibe} onBack={actions.onBack} />;
    case "maintenance-history":
      return (
        <MaintenanceHistoryScreen
          history={state.maintenanceHistory}
          onBack={actions.onBack}
        />
      );
    case "gallery":
      return <GalleryScreen images={state.gallery} onBack={actions.onBack} />;
    case "agreement":
      return (
        <AgreementScreen
          agreement={state.agreement}
          onBack={actions.onBack}
          onAccept={actions.onAcceptAgreement}
        />
      );
    case "announcements":
      return (
        <AnnouncementsScreen
          announcements={state.announcements}
          onBack={actions.onBack}
          onMarkRead={actions.onMarkAnnouncementRead}
          onPin={actions.onPinAnnouncement}
        />
      );
    case "property-health":
      return (
        <PropertyHealthScreen
          health={state.propertyHealth}
          onBack={actions.onBack}
        />
      );
    default:
      return null;
  }
}
