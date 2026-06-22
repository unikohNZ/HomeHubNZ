/**
 * Ella AI — role-aware chat replies, quick actions, GPT-ready API.
 */

import api from "./api";
import { isMockMode } from "../utils/dataSource";

export type EllaUserRole = "flatmate" | "landlord" | "tenant";

export interface EllaMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface EllaPreviewMessage {
  role: "user" | "assistant";
  content: string;
}

export interface EllaActivityItem {
  id: string;
  icon: string;
  text: string;
  time?: string;
}

export interface EllaOverdueTenant {
  tenantName: string;
  propertyName: string;
  amount: number;
  daysOverdue: number;
}

export interface EllaContext {
  role?: EllaUserRole;
  userName?: string;
  propertyName?: string;
  nextRentAmount?: number;
  nextRentDate?: string | null;
  rentDaysUntil?: number | null;
  notificationCount?: number;
  maintenanceActive?: number;
  documentCount?: number;
  /** Landlord portfolio context */
  monthlyIncome?: number;
  collectedThisMonth?: number;
  outstandingRent?: number;
  propertyCount?: number;
  pendingJoinRequests?: number;
  occupancyRate?: number;
  activeMaintenanceTitles?: string[];
  overdueTenants?: EllaOverdueTenant[];
}

export interface EllaContextResponse {
  role: string;
  user_name: string;
  data_source: string;
  activity: EllaActivityItem[];
  chat_preview: EllaPreviewMessage[];
  property_count: number;
  unread_notifications: number;
  maintenance_active_count: number;
  monthly_income?: number | null;
  collected_this_month?: number | null;
  outstanding_rent?: number | null;
  next_rent_amount?: number | null;
  next_rent_date?: string | null;
  rent_days_until?: number | null;
}

export interface EllaQuickAction {
  id: string;
  icon: string;
  label: string;
  userMessage: string;
  accent?: boolean;
}

export const ELLA_FLATMATE_ACTIONS: EllaQuickAction[] = [
  { id: "tenant-rent", icon: "💰", label: "Check Rent", userMessage: "Check my rent balance" },
  { id: "tenant-flat", icon: "🏠", label: "My Flat", userMessage: "Tell me about my flat" },
  { id: "tenant-rules", icon: "📄", label: "House Rules", userMessage: "View house rules" },
  { id: "tenant-maintenance", icon: "🔧", label: "Maintenance", userMessage: "Report maintenance" },
  { id: "tenant-messages", icon: "💬", label: "Messages", userMessage: "Open my messages" },
  { id: "tenant-rentals", icon: "📍", label: "Find Rentals Near Me", userMessage: "Find flats near me", accent: true },
];

export const ELLA_LANDLORD_ACTIONS: EllaQuickAction[] = [
  { id: "landlord-collection", icon: "💰", label: "Rent Collection", userMessage: "Check rent collection" },
  { id: "landlord-tenants", icon: "👥", label: "Tenants", userMessage: "Tell me about my tenants" },
  { id: "landlord-properties", icon: "🏠", label: "Properties", userMessage: "Manage properties" },
  { id: "landlord-maintenance", icon: "🔧", label: "Maintenance Requests", userMessage: "Review maintenance requests" },
  { id: "landlord-income", icon: "📊", label: "Income Report", userMessage: "View income report" },
  { id: "landlord-messages", icon: "💬", label: "Messages", userMessage: "Open my messages" },
];

/** @deprecated Use getEllaQuickActions(role) */
export const ELLA_QUICK_ACTIONS = ELLA_FLATMATE_ACTIONS;

function formatCurrency(n: number): string {
  return `$${n.toLocaleString("en-NZ")}`;
}

function normalizeRole(role?: EllaUserRole): "flatmate" | "landlord" {
  if (role === "landlord") return "landlord";
  return "flatmate";
}

export function isLandlordRole(role?: EllaUserRole): boolean {
  return normalizeRole(role) === "landlord";
}

export function getEllaQuickActions(role?: EllaUserRole): EllaQuickAction[] {
  return isLandlordRole(role) ? ELLA_LANDLORD_ACTIONS : ELLA_FLATMATE_ACTIONS;
}

function rentDueLabel(days: number | null | undefined): string {
  if (days === null || days === undefined) return "soon";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

function findQuickAction(content: string, ctx: EllaContext): EllaQuickAction | undefined {
  const actions = getEllaQuickActions(ctx.role);
  const lower = content.toLowerCase();
  return actions.find(
    (a) =>
      a.userMessage.toLowerCase() === lower ||
      a.label.toLowerCase() === lower ||
      a.id === content,
  );
}

export function buildRecentActivity(ctx: EllaContext): EllaActivityItem[] {
  const items: EllaActivityItem[] = [];

  if (isLandlordRole(ctx.role)) {
    if ((ctx.outstandingRent ?? 0) > 0) {
      items.push({
        id: "outstanding",
        icon: "💰",
        text: `${formatCurrency(ctx.outstandingRent!)} outstanding rent`,
        time: "This month",
      });
    }
    const overdue = ctx.overdueTenants ?? [];
    if (overdue.length > 0) {
      const first = overdue[0];
      items.push({
        id: "overdue",
        icon: "⚠️",
        text: `${first.tenantName} — ${formatCurrency(first.amount)} overdue`,
        time: `${first.daysOverdue} day${first.daysOverdue === 1 ? "" : "s"}`,
      });
    }
    if ((ctx.maintenanceActive ?? 0) > 0) {
      items.push({
        id: "maint",
        icon: "🔧",
        text: `${ctx.maintenanceActive} active maintenance request${ctx.maintenanceActive === 1 ? "" : "s"}`,
        time: "Recently",
      });
    }
    if ((ctx.pendingJoinRequests ?? 0) > 0) {
      items.push({
        id: "join",
        icon: "👥",
        text: `${ctx.pendingJoinRequests} pending join request${ctx.pendingJoinRequests === 1 ? "" : "s"}`,
        time: "Today",
      });
    }
    if (items.length === 0) {
      items.push({
        id: "portfolio-ok",
        icon: "✨",
        text: "Your portfolio is looking healthy today",
        time: "Just now",
      });
    }
    return items.slice(0, 3);
  }

  if (ctx.rentDaysUntil !== null && ctx.rentDaysUntil !== undefined) {
    items.push({
      id: "rent",
      icon: "🔔",
      text: `Rent due ${rentDueLabel(ctx.rentDaysUntil)}`,
      time: ctx.nextRentDate ?? undefined,
    });
  }
  if ((ctx.maintenanceActive ?? 0) > 0) {
    items.push({
      id: "maint",
      icon: "🔧",
      text: "Maintenance request updated",
      time: "Recently",
    });
  }
  if ((ctx.documentCount ?? 0) > 0) {
    items.push({
      id: "doc",
      icon: "📄",
      text: "New lease document uploaded",
      time: "This week",
    });
  }
  if ((ctx.notificationCount ?? 0) > 0) {
    items.push({
      id: "notif",
      icon: "📢",
      text: `${ctx.notificationCount} new notice${ctx.notificationCount === 1 ? "" : "s"} waiting`,
      time: "Today",
    });
  }
  if (items.length === 0) {
    items.push({
      id: "all-good",
      icon: "✨",
      text: "Everything looks good at your flat today",
      time: "Just now",
    });
  }
  return items.slice(0, 3);
}

export function buildChatPreview(ctx: EllaContext): EllaPreviewMessage[] {
  if (isLandlordRole(ctx.role)) {
    const income = ctx.monthlyIncome;
    const outstanding = ctx.outstandingRent;
    if (income == null && outstanding == null) {
      return [
        { role: "assistant", content: "Ask me about rent collection, tenants, or your income report." },
        { role: "user", content: "Thanks Ella!" },
        { role: "assistant", content: "You're welcome 😺" },
      ];
    }
    return [
      {
        role: "assistant",
        content: `Your expected monthly income is ${formatCurrency(income ?? 0)}. You have ${formatCurrency(outstanding ?? 0)} outstanding across your properties.`,
      },
      { role: "user", content: "Thanks Ella!" },
      { role: "assistant", content: "You're welcome 😺" },
    ];
  }

  if (ctx.nextRentAmount == null && !ctx.nextRentDate) {
    return [
      { role: "assistant", content: "You're all caught up on rent right now." },
      { role: "user", content: "Thanks Ella!" },
      { role: "assistant", content: "You're welcome 😺" },
    ];
  }

  const date = ctx.nextRentDate ?? "your next due date";
  const amount = ctx.nextRentAmount ?? 0;
  return [
    {
      role: "assistant",
      content: `Your next rent payment of ${formatCurrency(amount)} is due on ${date}.`,
    },
    { role: "user", content: "Thanks Ella!" },
    { role: "assistant", content: "You're welcome 😺" },
  ];
}

function getFlatmateQuickActionReply(actionId: string, ctx: EllaContext): string {
  switch (actionId) {
    case "tenant-rent": {
      if (ctx.nextRentAmount == null && !ctx.nextRentDate) {
        return "You're all caught up on rent — no upcoming payments due right now.";
      }
      const amount = ctx.nextRentAmount ?? 0;
      const date = ctx.nextRentDate ?? "your next due date";
      const status =
        ctx.rentDaysUntil != null && ctx.rentDaysUntil < 0
          ? `overdue by ${Math.abs(ctx.rentDaysUntil)} day${Math.abs(ctx.rentDaysUntil) === 1 ? "" : "s"}`
          : "on track";
      return `Your next rent is ${formatCurrency(amount)} due on ${date}. You're currently ${status}.`;
    }
    case "tenant-flat": {
      const name = ctx.propertyName ?? "your flat";
      return `${name} is your home base! Check My Flat for address, lease dates, rent share, and occupancy.`;
    }
    case "tenant-flatmates":
      return "See everyone in your flat under My Flat → Flatmates. You can message the group from More → Messages.";
    case "tenant-maintenance":
      return "Sure! Tell me what needs fixing and I'll help create a maintenance request.";
    case "tenant-rules":
      return "Open My Flat → House Rules to view the rules saved for your flat.";
    case "tenant-message":
      return "Open Messages from More to chat with your landlord. I can help you draft a message if you'd like!";
    case "tenant-notices": {
      const count = ctx.notificationCount ?? 0;
      if (count === 0) {
        return "You're all caught up — no new notices right now.";
      }
      return `You have ${count} unread notice${count === 1 ? "" : "s"}. Check More → Notifications for details.`;
    }
    case "tenant-messages":
      return "Open Messages from the bottom tab to chat with your landlord and flatmates.";
    case "tenant-rentals":
      return "You're searching near your saved location. Open Find Rentals to browse flats nearby.";
    default:
      return "How can I help with your flat today?";
  }
}

function getLandlordQuickActionReply(actionId: string, ctx: EllaContext): string {
  const income = ctx.monthlyIncome ?? 0;
  const collected = ctx.collectedThisMonth ?? 0;
  const outstanding = ctx.outstandingRent ?? 0;
  const propertyCount = ctx.propertyCount ?? 0;
  const pendingJoin = ctx.pendingJoinRequests ?? 0;
  const activeMaint = ctx.activeMaintenanceTitles ?? [];
  const overdue = ctx.overdueTenants ?? [];

  switch (actionId) {
    case "landlord-collection":
      return `Your expected monthly income is ${formatCurrency(income)}. You have ${formatCurrency(collected)} collected this month and ${formatCurrency(outstanding)} outstanding.`;
    case "landlord-tenants": {
      const overdueCount = overdue.length;
      const joinLine =
        pendingJoin > 0
          ? ` You also have ${pendingJoin} pending join request${pendingJoin === 1 ? "" : "s"}.`
          : "";
      if (overdueCount === 0) {
        return `All tenants are up to date with rent.${joinLine} Open Tenants in More to manage flatmates and rooms.`;
      }
      const first = overdue[0];
      return `You have ${overdueCount} overdue tenant${overdueCount === 1 ? "" : "s"}. ${first.propertyName} has ${formatCurrency(first.amount)} overdue by ${first.daysOverdue} day${first.daysOverdue === 1 ? "" : "s"}.${joinLine}`;
    }
    case "landlord-overdue": {
      if (overdue.length === 0) {
        return "Great news — no tenants are overdue right now. Everyone is up to date with rent.";
      }
      const first = overdue[0];
      const suffix =
        overdue.length > 1
          ? ` ${overdue.length - 1} more tenant${overdue.length - 1 === 1 ? "" : "s"} also have outstanding rent.`
          : "";
      return `You have ${overdue.length} overdue tenant${overdue.length === 1 ? "" : "s"}. ${first.propertyName} has ${formatCurrency(first.amount)} overdue by ${first.daysOverdue} day${first.daysOverdue === 1 ? "" : "s"}.${suffix}`;
    }
    case "landlord-maintenance": {
      const count = ctx.maintenanceActive ?? activeMaint.length;
      if (count === 0) {
        return "No active maintenance requests — your properties are all clear.";
      }
      if (activeMaint.length >= 2) {
        return `You have ${count} active maintenance requests: ${activeMaint[0].toLowerCase()} and ${activeMaint[1].toLowerCase()}.`;
      }
      if (activeMaint.length === 1) {
        return `You have 1 active maintenance request: ${activeMaint[0].toLowerCase()}.`;
      }
      return `You have ${count} active maintenance request${count === 1 ? "" : "s"}. Check Maintenance in More for details.`;
    }
    case "landlord-properties":
      return `You currently manage ${propertyCount} propert${propertyCount === 1 ? "y" : "ies"}. Tap Properties to create, edit, or delete listings.`;
    case "landlord-join":
      return `You currently have ${pendingJoin} pending join request${pendingJoin === 1 ? "" : "s"}.`;
    case "landlord-reminder":
      return "I can help prepare a friendly rent reminder message for tenants with pending or overdue payments.";
    case "landlord-income": {
      const occupancy = ctx.occupancyRate ?? 0;
      return `Monthly income forecast: ${formatCurrency(income)}. Collected: ${formatCurrency(collected)}. Outstanding: ${formatCurrency(outstanding)}. Occupancy: ${occupancy}%. Open Payments for the full report.`;
    }
    case "landlord-messages":
      return "Open Messages from the bottom tab to chat with tenants and contractors.";
    case "landlord-ask":
      return "Ask me about rent collection, tenants, maintenance, properties, or your income report. I'm on it! 😸";
    default:
      return "How can I help manage your properties today?";
  }
}

export function getQuickActionReplyLocal(actionId: string, ctx: EllaContext): string {
  if (isLandlordRole(ctx.role)) {
    return getLandlordQuickActionReply(actionId, ctx);
  }
  return getFlatmateQuickActionReply(actionId, ctx);
}

/** @deprecated Use fetchEllaChat for API mode */
export function getQuickActionReply(actionId: string, ctx: EllaContext): string {
  return getQuickActionReplyLocal(actionId, ctx);
}

export async function fetchEllaContext(): Promise<EllaContextResponse> {
  const { data } = await api.get<EllaContextResponse>("/ai/ella/context");
  return data;
}

export async function fetchEllaChat(message: string, actionId?: string): Promise<string> {
  const { data } = await api.post<{ reply: string; data_source?: string }>("/ai/ella/chat", {
    message,
    action_id: actionId ?? undefined,
  });
  const reply = data.reply?.trim();
  if (!reply) throw new Error("Empty reply from Ella");
  return reply;
}

export function mapApiContextToEllaContext(
  apiCtx: EllaContextResponse,
  fallback: EllaContext = {},
): EllaContext {
  const role: EllaUserRole =
    apiCtx.role === "landlord" || apiCtx.role === "property_manager" || apiCtx.role === "admin"
      ? "landlord"
      : (fallback.role ?? "flatmate");

  return {
    ...fallback,
    role,
    userName: apiCtx.user_name || fallback.userName,
    nextRentAmount: apiCtx.next_rent_amount ?? fallback.nextRentAmount,
    nextRentDate: apiCtx.next_rent_date ?? fallback.nextRentDate,
    rentDaysUntil: apiCtx.rent_days_until ?? fallback.rentDaysUntil,
    notificationCount: apiCtx.unread_notifications ?? fallback.notificationCount,
    maintenanceActive: apiCtx.maintenance_active_count ?? fallback.maintenanceActive,
    monthlyIncome: apiCtx.monthly_income ?? fallback.monthlyIncome,
    collectedThisMonth: apiCtx.collected_this_month ?? fallback.collectedThisMonth,
    outstandingRent: apiCtx.outstanding_rent ?? fallback.outstandingRent,
    propertyCount: apiCtx.property_count ?? fallback.propertyCount,
  };
}

function matchFlatmateFreeText(text: string, ctx: EllaContext): string {
  const lower = text.toLowerCase();

  if (lower.includes("thank")) {
    return "You're welcome 😺 Anything else I can help with?";
  }
  if (lower.includes("rent") || lower.includes("balance") || lower.includes("pay")) {
    return getFlatmateQuickActionReply("tenant-rent", ctx);
  }
  if (lower.includes("maint") || lower.includes("repair") || lower.includes("fix")) {
    return getFlatmateQuickActionReply("tenant-maintenance", ctx);
  }
  if (lower.includes("rule")) {
    return getFlatmateQuickActionReply("tenant-rules", ctx);
  }
  if (lower.includes("landlord") || lower.includes("message")) {
    return getFlatmateQuickActionReply("tenant-message", ctx);
  }
  if (lower.includes("notice") || lower.includes("notification")) {
    return getFlatmateQuickActionReply("tenant-notices", ctx);
  }
  if (lower.includes("flatmate")) {
    return getFlatmateQuickActionReply("tenant-flatmates", ctx);
  }
  if (lower.includes("flat")) {
    return getFlatmateQuickActionReply("tenant-flat", ctx);
  }
  if (lower.includes("doc") || lower.includes("lease")) {
    return "I can help you find leases, receipts, and flat documents. Upload files from My Flat → Documents.";
  }

  return getFlatmateQuickActionReply("tenant-ask", ctx);
}

function matchLandlordFreeText(text: string, ctx: EllaContext): string {
  const lower = text.toLowerCase();

  if (lower.includes("thank")) {
    return "You're welcome 😺 Happy to help manage your portfolio.";
  }
  if (lower.includes("overdue") || lower.includes("late tenant")) {
    return getLandlordQuickActionReply("landlord-overdue", ctx);
  }
  if (lower.includes("tenant")) {
    return getLandlordQuickActionReply("landlord-tenants", ctx);
  }
  if (lower.includes("collect") || lower.includes("income") || lower.includes("outstanding")) {
    return getLandlordQuickActionReply("landlord-collection", ctx);
  }
  if (lower.includes("maint") || lower.includes("repair")) {
    return getLandlordQuickActionReply("landlord-maintenance", ctx);
  }
  if (lower.includes("propert")) {
    return getLandlordQuickActionReply("landlord-properties", ctx);
  }
  if (lower.includes("remind")) {
    return "I can help prepare a friendly rent reminder message for tenants with pending or overdue payments.";
  }
  if (lower.includes("report") || lower.includes("dashboard")) {
    return getLandlordQuickActionReply("landlord-income", ctx);
  }
  if (lower.includes("join") || lower.includes("request")) {
    return getLandlordQuickActionReply("landlord-tenants", ctx);
  }
  if (lower.includes("occupancy")) {
    const rate = ctx.occupancyRate ?? 0;
    return `Portfolio occupancy is ${rate}%. ${getLandlordQuickActionReply("landlord-properties", ctx)}`;
  }

  return getLandlordQuickActionReply("landlord-ask", ctx);
}

function matchFreeTextReply(text: string, ctx: EllaContext): string {
  if (isLandlordRole(ctx.role)) {
    return matchLandlordFreeText(text, ctx);
  }
  return matchFlatmateFreeText(text, ctx);
}

export async function generateEllaReply(
  message: string,
  ctx: EllaContext = {},
  actionId?: string,
): Promise<string> {
  const content = message.trim();
  if (!content) return "Say something and I'll help you out!";

  const quickAction = actionId ? undefined : findQuickAction(content, ctx);
  const resolvedActionId = actionId ?? quickAction?.id;

  if (!isMockMode()) {
    try {
      return await fetchEllaChat(content, resolvedActionId);
    } catch {
      return "I couldn't reach the server right now. Please check your connection and try again.";
    }
  }

  if (resolvedActionId) return getQuickActionReplyLocal(resolvedActionId, ctx);
  return matchFreeTextReply(content, ctx);
}

export function createEllaMessage(content: string, role: "user" | "assistant"): EllaMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export const ellaAIService = {
  sendMessage: async (message: string, context?: EllaContext): Promise<EllaMessage> => {
    const reply = await generateEllaReply(message, context ?? {});
    return createEllaMessage(reply, "assistant");
  },
};

export { ELLA_FLATMATE_ACTIONS as ELLA_QUICK_QUESTIONS };
