import { coreClient } from "./client";

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalChats: number;
  revenue: number;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role?: unknown;
  roleId?: number;
  isActive?: boolean;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  xp?: number;
  level?: number;
  createdAt?: string | null;
}

export interface AuditLogRecord {
  id: string;
  action?: string;
  metadata?: unknown;
  createdAt?: string | null;
  actorId?: string | null;
  targetUserId?: string | null;
  actor?: { displayName?: string; email?: string } | null;
  target?: { displayName?: string; email?: string } | null;
}

export interface ServiceHealth {
  name: string;
  url: string;
  status: string;
  latencyMs: number;
  detail?: unknown;
}

export interface HealthModel {
  name: string;
  table: string;
  count: number | null;
}

export interface SystemHealth {
  generatedAt: string;
  services: ServiceHealth[];
  models: { service: string; kind: string; models: HealthModel[]; available?: boolean }[];
}

export interface PaymentRecord {
  id: string;
  user: { id: string; displayName: string; email: string } | null;
  packageName: string;
  packageId: number;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerTransactionId: string | null;
  failureReason: string | null;
  tokens: number;
  createdAt: string;
  paidAt: string | null;
}

interface PaymentApiItem {
  id: string;
  userId: string;
  tokenPackageId: number;
  amount: string;
  currency: string;
  status: string;
  packageNameSnapshot: string;
  tokensSnapshot: number;
  priceSnapshot: string;
  currencySnapshot: string;
  provider: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; displayName: string | null; email: string } | null;
}

export interface PaymentsResponse {
  items: PaymentRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const toPaymentRecord = (item: PaymentApiItem): PaymentRecord => ({
  id: item.id,
  user: item.user
    ? {
        id: item.user.id,
        displayName: item.user.displayName ?? "Unknown",
        email: item.user.email,
      }
    : null,
  packageName: item.packageNameSnapshot,
  packageId: item.tokenPackageId,
  amount: Number(item.amount),
  currency: item.currency,
  status: item.status,
  provider: item.provider,
  providerTransactionId: null,
  failureReason: null,
  tokens: item.tokensSnapshot,
  createdAt: item.createdAt,
  paidAt: item.paidAt,
});

export interface AiUsageSummary {
  summary: { totalCalls: number; inputTokens: number; outputTokens: number; totalTokens: number; cost: number };
  daily: { day: string; inputTokens: number; outputTokens: number; totalTokens: number; cost: number; calls: number }[];
  perUser: {
    user: { id: string; displayName: string; email: string | null } | null;
    calls: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  }[];
  perModel: {
    model: string;
    source: string;
    calls: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  }[];
  recent: {
    id: string;
    user: { displayName: string; email: string } | null;
    source: string;
    model: string | null;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    createdAt: string;
  }[];
}

export const adminApi = {
  getStats: () => coreClient.get<AdminStats>("/admin/stats"),

  getUsers: () => coreClient.get<AdminUserRecord[]>("/admin/users"),

  banUser: (userId: string) =>
    coreClient.patch(`/admin/users/${userId}/ban`),

  unbanUser: (userId: string) =>
    coreClient.patch(`/admin/users/${userId}/unban`),

  changeUserRole: (userId: string, roleId: number) =>
    coreClient.patch(`/admin/users/${userId}/role`, { role_id: roleId }),

  getAuditLogs: () => coreClient.get<AuditLogRecord[]>("/admin/audit-logs"),

  getMonthlyStats: () =>
    coreClient.get<{ data: { name: string; users: number; chats: number }[] }>(
      "/admin/stats/monthly"
    ),

  getSystemHealth: () => coreClient.get<SystemHealth>("/admin/system/health"),

  getPayments: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await coreClient.get<{ success: boolean; data: { items: PaymentApiItem[]; pagination: PaymentsResponse["pagination"] } }>(
      "/admin/payments",
      { params }
    );
    return {
      data: {
        items: res.data.data.items.map(toPaymentRecord),
        pagination: res.data.data.pagination,
      },
    };
  },

  getAiUsage: () => coreClient.get<AiUsageSummary>("/admin/ai-usage"),
};
