import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const adminEmail = process.env.ADMIN_E2E_EMAIL ?? "admin@local.test";
const adminPassword = process.env.ADMIN_E2E_PASSWORD ?? process.env.BANKING_SEED_ADMIN_PASSWORD;
const gatewayUrl = process.env.GATEWAY_URL ?? "http://localhost:8080";

const localizedErrorStates = [
  /Failed to connect to gateway/i,
  /Internal server error/i,
  /Không tải được/i,
  /Error loading/i,
  /Không replay được/i,
  /Failed to replay/i,
  /Không tạm khóa được/i,
  /Failed to suspend/i,
  /Không chạy được đối soát/i,
  /Failed to run reconciliation/i,
];

const routeChecks = [
  {
    path: "/accounts",
    heading: /^(Tài khoản|Accounts)$/,
    content: /(Không tìm thấy tài khoản|No accounts found|VND|ACTIVE|SUSPENDED)/,
  },
  {
    path: "/transactions",
    heading: /^(Giao dịch|Transactions)$/,
    content: /(Không tìm thấy giao dịch|No transactions found|COMPLETED|PENDING|FAILED|VND)/,
  },
  {
    path: "/risk",
    heading: /^(Duyệt rủi ro|Risk reviews)$/i,
    content: /(Không tìm thấy đánh giá rủi ro|No risk evaluations found|Cho phép|Cảnh báo người dùng|Xác thực bổ sung|Duyệt thủ công|ALLOW|WARN_USER|STEP_UP_AUTH|MANUAL_REVIEW|BLOCK)/,
  },
  {
    path: "/reconciliation",
    heading: /^(Đối soát|Reconciliation)$/,
    content: /(Chưa có lần chạy gần đây|No recent runs|Run Reconciliation|Chạy đối soát)/,
  },
  {
    path: "/audit",
    heading: /^(Nhật ký audit|Audit Logs)$/,
    content: /(Chưa có nhật ký audit|No audit logs found|ADMIN|SYSTEM|LOGIN|SUSPEND)/,
  },
  {
    path: "/dlq",
    heading: /^Dead-Letter Queue$/,
    content: /(DLQ hiện đang trống|The DLQ is currently empty|Replay tất cả|Replay All)/,
  },
  {
    path: "/support",
    heading: /^(Ca hỗ trợ|Support Cases)$/,
    content: /(Không tìm thấy ca hỗ trợ|No support cases found|HUMAN_SUPPORT|OPEN|CLOSED)/,
  },
];

test.beforeAll(() => {
  if (!adminPassword) {
    throw new Error("ADMIN_E2E_PASSWORD or BANKING_SEED_ADMIN_PASSWORD must be set for release E2E");
  }
});

test("admin UI logs in and renders live backend-backed release screens", async ({ page, request }) => {
  const responseFailures: string[] = [];
  const browserFailures: string[] = [];

  page.on("response", (response) => {
    if (response.status() >= 500) {
      responseFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("console", (message) => {
    const text = message.text();
    if (
      message.type() === "error" ||
      text.includes("The width(-1) and height(-1) of chart should be greater than 0")
    ) {
      browserFailures.push(`${message.type()}: ${text}`);
    }
  });

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(adminEmail);
  await page.locator('input[name="password"]').fill(adminPassword!);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /^(Tổng quan|Dashboard)$/ })).toBeVisible();
  await assertNoVisibleErrors(page);
  await assertChartsAreStableWhenRendered(page);

  for (const check of routeChecks) {
    await page.goto(check.path);
    await expect(page).toHaveURL(new RegExp(`${check.path}$`));
    await expect(page.getByRole("heading", { name: check.heading })).toBeVisible();
    await expect(page.locator("body")).toContainText(check.content);
    await assertNoVisibleErrors(page);
  }

  const adminToken = await loginAdmin(request);
  const suspendAccount = await registerUser(request, "suspend");
  const supportCaseId = await createSupportCase(request, "support");
  await createManualReviewRisk(request, adminToken, "risk");

  await exerciseSuspendAccount(page, suspendAccount.email);
  await exerciseReconciliationRun(page);
  await exerciseSupportReplyAndClose(page, supportCaseId);
  await exerciseRiskApproval(page);
  await exerciseDlqEmptyState(page);

  expect(responseFailures, "release smoke should not hide backend/server 5xx responses").toEqual([]);
  expect(browserFailures, "release smoke should not log browser errors or unstable Recharts sizing").toEqual([]);
});

async function assertNoVisibleErrors(page: Page) {
  for (const errorText of localizedErrorStates) {
    await expect(page.locator("body")).not.toContainText(errorText, { timeout: 10_000 });
  }
}

async function assertChartsAreStableWhenRendered(page: Page) {
  for (const testId of ["saga-latency-chart", "failure-signals-chart"]) {
    const chart = page.getByTestId(testId);
    if ((await chart.count()) === 0) {
      continue;
    }
    await expect(chart).toBeVisible();
    const box = await chart.boundingBox();
    expect(box?.width ?? 0, `${testId} should have measurable width`).toBeGreaterThan(0);
    expect(box?.height ?? 0, `${testId} should have measurable height`).toBeGreaterThan(0);
  }
}

async function exerciseSuspendAccount(page: Page, email: string) {
  await page.goto(`/accounts?q=${encodeURIComponent(email)}`);
  await page.getByRole("link", { name: new RegExp(email) }).click();
  await page.getByRole("button", { name: /^(Tạm khóa tài khoản|Suspend Account)$/ }).click();
  await page.getByRole("button", { name: /^(Xác nhận tạm khóa|Confirm Suspend)$/ }).click();
  await expect(page.locator("body")).toContainText(/(Đã tạm khóa tài khoản|Account suspended successfully|SUSPENDED|Tạm khóa)/);
  await assertNoVisibleErrors(page);
}

async function exerciseReconciliationRun(page: Page) {
  await page.goto("/reconciliation");
  await page.getByRole("button", { name: /(Chạy đối soát|Run Reconciliation)/ }).click();
  await page.getByRole("button", { name: /^(Xác nhận chạy|Confirm Run)$/ }).click();
  await expect(page.locator("body")).toContainText(/(Sổ cân bằng hoàn toàn|Sổ sách cân bằng|Cân bằng|Books balanced|BALANCED|SUCCESS)/);
  await assertNoVisibleErrors(page);
}

async function exerciseSupportReplyAndClose(page: Page, caseId: string) {
  await page.goto(`/support?q=${caseId}`);
  await page.getByRole("link", { name: /^(Mở|Open)$/ }).click();
  await page.locator("#support-reply").fill("Release E2E support reply.");
  await page.getByRole("button", { name: /^(Gửi trả lời|Send Reply)$/ }).click();
  await expect(page.locator("body")).toContainText("Release E2E support reply.");
  await page.locator("#support-resolution").fill("Release E2E support case closed.");
  await page.getByRole("button", { name: /^(Đóng ca|Close Case)$/ }).click();
  await expect(page.locator("body")).toContainText(/(CLOSED|Đã đóng|Closed)/);
  await assertNoVisibleErrors(page);
}

async function exerciseRiskApproval(page: Page) {
  await page.goto("/risk?action=MANUAL_REVIEW");
  page.once("dialog", (dialog) => dialog.accept("Release E2E manual review approval."));
  await page.getByRole("button", { name: /^(Duyệt|Approve)$/ }).first().click();
  await expect(page.locator("body")).toContainText(/(MANUAL_APPROVED|Đã duyệt|Approved|Không tìm thấy đánh giá rủi ro|No risk evaluations found)/);
  await assertNoVisibleErrors(page);
}

async function exerciseDlqEmptyState(page: Page) {
  await page.goto("/dlq");
  await expect(page.locator("body")).toContainText(/(DLQ hiện đang trống|The DLQ is currently empty)/);
  await expect(page.getByRole("button", { name: /^(Replay tất cả|Replay All)$/ })).toBeDisabled();
  await assertNoVisibleErrors(page);
}

async function loginAdmin(request: APIRequestContext) {
  const response = await request.post(`${gatewayUrl}/api/auth/login`, {
    data: { identifier: adminEmail, password: adminPassword },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  return ((await response.json()) as { accessToken: string }).accessToken;
}

async function registerUser(request: APIRequestContext, label: string) {
  const suffix = randomId();
  const email = `release-${label}-${suffix}@example.test`;
  const response = await request.post(`${gatewayUrl}/api/auth/register`, {
    data: {
      email,
      phone: `+84${suffix}`,
      password: "Password123!",
      pin: "123456",
      currency: "VND",
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  const payload = (await response.json()) as { accountId: string; accessToken: string };
  return { ...payload, email };
}

async function createSupportCase(request: APIRequestContext, label: string) {
  const user = await registerUser(request, label);
  const session = await postJson<{ sessionId: string }>(
    request,
    "/api/support/chat/sessions",
    { initialMessage: "my pin 123456 is not working" },
    user.accessToken
  );
  const handoff = await postJson<{ caseId: string }>(
    request,
    `/api/support/chat/sessions/${session.sessionId}/handoff`,
    { reason: "USER_REQUESTED_HUMAN" },
    user.accessToken
  );
  return handoff.caseId;
}

async function createManualReviewRisk(request: APIRequestContext, adminToken: string, label: string) {
  const sender = await registerUser(request, `${label}-sender`);
  const target = await registerUser(request, `${label}-target`);
  const baselineReceiver = await registerUser(request, `${label}-baseline`);
  await postJson(request, `/api/accounts/${sender.accountId}/deposit`, { amount: "1000" }, adminToken);

  const baseline = await transfer(request, sender.accessToken, baselineReceiver.email, "10");
  await waitForTransaction(request, sender.accessToken, transactionIdOf(baseline), "COMPLETED");

  for (let i = 0; i < 10; i += 1) {
    const inbound = await registerUser(request, `${label}-inbound-${i}`);
    await postJson(request, `/api/accounts/${inbound.accountId}/deposit`, { amount: "10" }, adminToken);
    const inboundTransfer = await transfer(request, inbound.accessToken, target.email, "1");
    await waitForTransaction(request, inbound.accessToken, transactionIdOf(inboundTransfer), "COMPLETED");
  }

  const review = await transfer(request, sender.accessToken, target.email, "100", "urgent investment");
  expect(review.result).toBe("RISK_MANUAL_REVIEW_REQUIRED");
  expect(review.recommendedAction).toBe("MANUAL_REVIEW");
}

async function transfer(
  request: APIRequestContext,
  token: string,
  recipientEmail: string,
  amount: string,
  note?: string
) {
  const idempotencyKey = crypto.randomUUID();
  const body = { recipientEmail, amount, idempotencyKey, pin: "123456", note };
  const first = await postJson<{
    id?: string;
    transactionId?: string;
    result?: string;
    recommendedAction?: string;
    riskEvaluationId?: string;
  }>(
    request,
    "/api/transactions/transfer",
    body,
    token,
    idempotencyKey
  );
  if (first.result === "RISK_WARNING_REQUIRED") {
    return postJson<{ id?: string; transactionId?: string; result?: string; recommendedAction?: string }>(
      request,
      "/api/transactions/transfer",
      { ...body, riskEvaluationId: first.riskEvaluationId, riskAcknowledged: true },
      token,
      idempotencyKey
    );
  }
  return first;
}

function transactionIdOf(response: { id?: string; transactionId?: string }) {
  const transactionId = response.id ?? response.transactionId;
  if (!transactionId) {
    throw new Error(`Transfer response did not include a transaction id: ${JSON.stringify(response)}`);
  }
  return transactionId;
}

async function waitForTransaction(
  request: APIRequestContext,
  token: string,
  transactionId: string,
  expected: string
) {
  for (let i = 0; i < 30; i += 1) {
    const response = await request.get(`${gatewayUrl}/api/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    const transaction = (await response.json()) as { status: string };
    if (transaction.status === expected) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Transaction ${transactionId} did not reach ${expected}`);
}

async function postJson<T>(
  request: APIRequestContext,
  path: string,
  data: unknown,
  token?: string,
  idempotencyKey?: string
) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await request.post(`${gatewayUrl}${path}`, { data, headers });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()) as T;
}

function randomId() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`.slice(-10);
}
