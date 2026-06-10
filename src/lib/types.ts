export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Account {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED" | string;
  balance: string; // Decimal-as-string
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  journalId: string;
  amount: string; // Decimal-as-string
  currency: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "COMPENSATING" | "CANCELLED" | string;
  type: string;
  senderId: string | null;
  recipientId: string | null;
  note: string | null;
  failureReason: string | null;
  compensated: boolean;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  journalId: string;
  accountId: string;
  amount: string; // Decimal-as-string
  currency: string;
  entryType: "DEBIT" | "CREDIT" | string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  details: string | null;
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
  ledgerBalance: string;
  cachedBalance: string;
  drift: string;
  status: "BALANCED" | "DRIFT";
}

export interface ReconciliationResult {
  timestamp: string;
  status: "SUCCESS" | "DRIFT_DETECTED" | "FAILED";
  driftCount: number;
  findings: ReconciliationFinding[];
}

export interface SystemMetrics {
  transferFailedTotal: number;
  transferCompensatingTotal: number;
  walletSagaLatency: number;
  walletConsumerLag: number;
  walletDlqDepth: number;
  reconciliationDrift: number;
}
