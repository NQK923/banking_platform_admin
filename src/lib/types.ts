export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Account {
  id: string;
  userId?: string | null;
  email: string | null;
  phoneNumber: string | null;
  code?: string | null;
  kind?: "USER" | "SYSTEM" | string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED" | string;
  balance: string | number; // Decimal-as-string; tolerate numeric legacy JSON for display only
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  journalId?: string | null;
  correlationId?: string | null;
  idempotencyKey?: string | null;
  amount: string | number; // Decimal-as-string; tolerate numeric legacy JSON for display only
  currency: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "COMPENSATING" | "CANCELLED" | string;
  type: string;
  senderId: string | null;
  recipientId: string | null;
  receiverId?: string | null;
  note: string | null;
  failureReason: string | null;
  reviewStatus?: string | null;
  riskEvaluationId?: string | null;
  compensated: boolean;
  createdAt: string;
}

export interface RiskReason {
  code: string;
  weight: number;
  message: string;
  evidence: Record<string, string>;
}

export interface RiskEvaluation {
  id?: string;
  riskEvaluationId?: string;
  transactionId?: string | null;
  senderAccountId: string;
  receiverAccountId?: string | null;
  idempotencyKey: string;
  payloadHash?: string;
  amount: string | number;
  currency: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  recommendedAction: "ALLOW" | "WARN_USER" | "STEP_UP_AUTH" | "MANUAL_REVIEW" | "BLOCK" | string;
  reasons: RiskReason[];
  features: Record<string, string>;
  modelVersion: string;
  policyVersion: string;
  decisionStatus: string;
  traceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  journalId: string;
  accountId: string;
  amount: string | number; // Decimal-as-string; tolerate numeric legacy JSON for display only
  currency: string;
  entryType: "DEBIT" | "CREDIT" | string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  action?: string | null;
  targetId?: string | null;
  targetType?: string | null;
  details?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  eventType?: string | null;
  actorType?: string | null;
  payload?: Record<string, string> | null;
  createdAt: string;
}

export interface DlqMessage {
  eventId: string;
  partition: number;
  offset: number;
  topic: string;
  eventType: string;
  errorReason: string;
  attempts: number;
  createdAt: string;
}

export interface ReconciliationFinding {
  accountId: string;
  ledgerBalance: string | number;
  cachedBalance: string | number;
  drift: string | number;
  status: "BALANCED" | "DRIFT";
}

export interface ReconciliationResult {
  timestamp: string;
  status: "SUCCESS" | "DRIFT_DETECTED" | "FAILED";
  driftCount: number;
  findings: ReconciliationFinding[];
}

export interface SupportChatMessage {
  id: string;
  sessionId: string;
  senderType: "USER" | "AI" | "ADMIN" | "SYSTEM" | string;
  message: string;
  metadata?: Record<string, string> | null;
  createdAt: string;
}

export interface SupportCase {
  caseId: string;
  sessionId: string;
  userId: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;
  topic: string;
  relatedTransactionId?: string | null;
  assignedAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTransactionSnapshot {
  id: string;
  status: string;
  failureReason?: string | null;
  compensated: boolean;
  traceId?: string | null;
}

export interface SupportCaseDetail {
  caseId: string;
  sessionId: string;
  status: string;
  topic: string;
  relatedTransactionId?: string | null;
  summary: string;
  messages: SupportChatMessage[];
  transactionSnapshot?: SupportTransactionSnapshot | null;
}

export interface SystemMetrics {
  transferFailedTotal: number;
  transferCompensatingTotal: number;
  walletSagaLatency: number;
  walletConsumerLag: number;
  walletDlqDepth: number;
  reconciliationDrift: number;
}
