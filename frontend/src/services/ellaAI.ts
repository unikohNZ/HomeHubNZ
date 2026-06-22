/** @deprecated Import from ./ellaService instead */
export {
  buildChatPreview,
  buildRecentActivity,
  createEllaMessage,
  ellaAIService,
  ELLA_FLATMATE_ACTIONS,
  ELLA_LANDLORD_ACTIONS,
  ELLA_QUICK_ACTIONS,
  ELLA_FLATMATE_ACTIONS as ELLA_QUICK_QUESTIONS,
  generateEllaReply,
  getEllaQuickActions,
  getQuickActionReply,
  isLandlordRole,
} from "./ellaService";

export type {
  EllaActivityItem,
  EllaContext,
  EllaMessage,
  EllaOverdueTenant,
  EllaPreviewMessage,
  EllaQuickAction,
  EllaUserRole,
} from "./ellaService";
