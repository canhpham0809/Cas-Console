"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type AppData = { id: string; name: string; short: string; color: string; environment: string };
type AnalyticsTab = "Connection" | "Transaction" | "Identity" | "Balance" | "QRPay" | "VirtualAccount" | "BalanceHook" | "Transfer" | "eKYC" | "Invoice" | "Deeplink";
type DetailRow = { requestId: string; grant: string; user: string; bank: string; scopes: string; calls: string; status: string; last: string; cost: string; endpoint: string; http: string; latency: string; webhook?: string };
type LogRecord = {
  requestId: string;
  method: "GET" | "POST";
  endpoint: string;
  scope: string;
  grantId: string;
  bank: string;
  http: string;
  latency: string;
  createdAt: string;
  requestBody: string;
  responseBody: string;
};

type TeamData = { id: string; name: string; short: string; role: string; apps: AppData[] };

type TeamMember = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "PENDING";
  phone: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "MEMBER";
};

const initialMembers: TeamMember[] = [
  { id: "m_1", name: "Canh", email: "canhphq@cas.so", status: "ACTIVE", phone: "0395834812", role: "OWNER" },
  { id: "m_2", name: "Minh Nguyễn", email: "minh.nguyen@vietfin.vn", status: "ACTIVE", phone: "0912345678", role: "ADMIN" },
  { id: "m_3", name: "Hưng Trần", email: "hung.tran@cas.so", status: "ACTIVE", phone: "0987654321", role: "DEVELOPER" },
];

type PermissionKey =
  | "view_secret"
  | "manage_app"
  | "view_request_log"
  | "view_webhook_log"
  | "view_link_log"
  | "manage_redirect_uri"
  | "view_redirect_uri";

const roleDefaultPermissions: Record<string, PermissionKey[]> = {
  "Thành viên": ["view_request_log", "view_link_log", "view_redirect_uri"],
  "Nhà phát triển": ["view_secret", "view_request_log", "view_webhook_log", "view_link_log", "manage_redirect_uri", "view_redirect_uri"],
  "Quản trị viên": ["view_secret", "manage_app", "view_request_log", "view_webhook_log", "view_link_log", "manage_redirect_uri", "view_redirect_uri"],
};

const languages = [
  { code: "VI", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "ZH", name: "中文", flag: "🇨🇳" },
];

const teams: TeamData[] = [
  {
    id: "team_1", name: "VietFin Digital", short: "VD", role: "Owner",
    apps: [
      { id: "app_8F2KD91M", name: "BankHub EKYC", short: "BE", color: "#16a34a", environment: "Production" },
      { id: "app_3H7NP24Q", name: "FinFlow Personal", short: "FP", color: "#16856f", environment: "Production" },
      { id: "app_9C1RT63V", name: "LendNow Sandbox", short: "LN", color: "#d9773b", environment: "Sandbox" },
    ]
  },
  {
    id: "team_2", name: "Techcom Solutions", short: "TS", role: "Admin",
    apps: [
      { id: "app_7X9AB12C", name: "Payment Gateway", short: "PG", color: "#e63946", environment: "Production" },
      { id: "app_1Y4ZB99D", name: "Internal Tools", short: "IT", color: "#457b9d", environment: "Staging" }
    ]
  }
];

const navGroups = [
  { label: "", items: [{ icon: "⌂", label: "Tổng quan" }] },
  { label: "DEVELOPER", items: [{ icon: "⌁", label: "Keys" }, { icon: "⇄", label: "RedirectURI/IP" }, { icon: "◫", label: "Webhooks" }, { icon: "≡", label: "Logs" }] },
  { label: "HOẠT ĐỘNG", items: [{ icon: "◎", label: "Grants" }, { icon: "⊞", label: "Usage" }, { icon: "💳", label: "Billing" }, { icon: "◇", label: "Grant debugger" }] },
  { label: "CẤU HÌNH", items: [{ icon: "⚙", label: "Cài đặt App" }] },
];

const baseRows: DetailRow[] = [
  { requestId: "req_8K2MP91N", grant: "grt_8L2KP91N", user: "Nguyễn Minh Anh", bank: "Techcombank", scopes: "Transaction · Balance · Identity", calls: "28,491", status: "Active", last: "2 phút trước", cost: "₫1,424,550", endpoint: "/v2/transactions", http: "200", latency: "284 ms" },
  { requestId: "req_4T7QD20A", grant: "grt_4T7MD20Q", user: "Trần Hoàng Long", bank: "Vietcombank", scopes: "Balance · QRPay · Transfer", calls: "18,420", status: "Active", last: "11 phút trước", cost: "₫921,000", endpoint: "/v2/balance", http: "200", latency: "326 ms" },
  { requestId: "req_1A9VC63F", grant: "grt_1A9HC63V", user: "Phạm Thùy Linh", bank: "MB Bank", scopes: "Identity · eKYC", calls: "12,708", status: "Paused", last: "36 phút trước", cost: "₫635,400", endpoint: "/v2/identity", http: "200", latency: "412 ms" },
  { requestId: "req_6P3RF82W", grant: "grt_6P3RF82K", user: "Đỗ Tuấn Nam", bank: "ACB", scopes: "VirtualAccount · Invoice", calls: "7,906", status: "Deleted", last: "Hôm qua", cost: "₫395,300", endpoint: "/v2/virtual-accounts", http: "429", latency: "602 ms" },
];

const scopeConfig: Record<Exclude<AnalyticsTab, "Connection">, { grants: string; costGrants: string; active: string; calls: string; cost: string; endpoints: string[]; price: number; webhook?: boolean }> = {
  Transaction: { grants: "68", costGrants: "6.200.000 VNĐ", active: "62", calls: "426.800", cost: "19.004.000", endpoints: ["/v2/transactions", "/v2/transactions/sync", "/v2/transactions/{id}"], price: 50 },
  Identity: { grants: "1.842", costGrants: "750.000 VNĐ", active: "1.806", calls: "204.100", cost: "12.246.000", endpoints: ["/v2/identity", "/v2/identity/profile", "/v2/accounts/owner"], price: 60 },
  Balance: { grants: "2.204", costGrants: "750.000 VNĐ", active: "2.171", calls: "281.400", cost: "9.849.000", endpoints: ["/v2/balance", "/v2/accounts", "/v2/accounts/{id}/balance"], price: 35 },
  QRPay: { grants: "986", costGrants: "750.000 VNĐ", active: "954", calls: "146.700", cost: "3.280.000", endpoints: ["/v2/qr/create", "/v2/qr/{id}", "/v2/qr/status"], price: 40, webhook: true },
  VirtualAccount: { grants: "742", costGrants: "750.000 VNĐ", active: "716", calls: "98.400", cost: "1.520.000", endpoints: ["/v2/virtual-accounts", "/v2/virtual-accounts/{id}", "/v2/virtual-accounts/transactions"], price: 50, webhook: true },
  BalanceHook: { grants: "2.204", costGrants: "750.000 VNĐ", active: "2.171", calls: "281.400", cost: "84.270.000", endpoints: ["/v2/balance/webhook", "/v2/balance/events"], price: 35, webhook: true },
  Transfer: { grants: "1.126", costGrants: "750.000 VNĐ", active: "1.084", calls: "108.200", cost: "2.600.000", endpoints: ["/v2/transfers", "/v2/transfers/{id}", "/v2/transfers/confirm"], price: 80 },
  eKYC: { grants: "1.508", costGrants: "750.000 VNĐ", active: "1.492", calls: "176.500", cost: "14.120.000", endpoints: ["/v2/ekyc/sessions", "/v2/ekyc/verify", "/v2/ekyc/results/{id}"], price: 80 },
  Invoice: { grants: "624", costGrants: "750.000 VNĐ", active: "603", calls: "72.600", cost: "3.630.000", endpoints: ["/v2/invoices", "/v2/invoices/{id}", "/v2/invoices/search"], price: 50 },
  Deeplink: { grants: "820", costGrants: "750.000 VNĐ", active: "795", calls: "115.400", cost: "11.540.000", endpoints: ["/v2/deeplink/generate", "/v2/deeplink/resolve", "/v2/deeplink/status"], price: 100 },
};

function buildScopeRows(scope: Exclude<AnalyticsTab, "Connection">): DetailRow[] {
  const config = scopeConfig[scope];
  return Array.from({ length: 18 }, (_, index) => {
    const row = baseRows[index % baseRows.length];
    const numericCalls = 1482 - index * 47;
    const failed = index === 6 || index === 13;
    return {
      ...row,
      requestId: `req_${scope.slice(0, 3).toUpperCase()}${String(84291 - index * 137).padStart(5, "0")}`,
      scopes: scope,
      calls: numericCalls.toLocaleString("en-US"),
      status: failed ? "Failed" : "Success",
      endpoint: config.endpoints[index % config.endpoints.length],
      cost: `₫${(numericCalls * config.price).toLocaleString("en-US")}`,
      http: failed ? (index === 6 ? "429" : "500") : "200",
      latency: `${214 + (index * 37) % 410} ms`,
      last: index < 3 ? `${2 + index * 4} phút trước` : `${10 + index * 3} phút trước`,
      webhook: config.webhook ? (index === 5 ? "Retrying" : index === 13 ? "Failed" : "Delivered") : undefined,
    };
  });
}

const scopeUnits: Record<Exclude<AnalyticsTab, "Connection">, string> = {
  Transaction: "giao dịch",
  Identity: "lần",
  Balance: "lần",
  QRPay: "giao dịch",
  VirtualAccount: "giao dịch",
  BalanceHook: "giao dịch",
  Transfer: "giao dịch",
  eKYC: "lượt",
  Invoice: "hóa đơn",
  Deeplink: "lượt",
};

const analyticsData: Record<AnalyticsTab, {
  subtitle: string;
  metrics: { label: string; value: string; change?: string; tone?: string; unit?: string }[];
  rows: DetailRow[];
  hasWebhook?: boolean;
}> = {
  Connection: {
    subtitle: "Tổng hợp Grant ID đã kết nối và các scope được cấp quyền",
    metrics: [
      { label: "Tổng Grant", value: "2.847", unit: "" },
      { label: "Đang hoạt động", value: "2.592", unit: "" },
      { label: "Thêm mới trong tháng", value: "184", unit: "" },
      { label: "Đã xoá/dừng trong tháng", value: "3", tone: "danger", unit: "" },
    ],
    rows: baseRows,
  },
  ...Object.fromEntries((Object.keys(scopeConfig) as Exclude<AnalyticsTab, "Connection">[]).map(scope => {
    const config = scopeConfig[scope];
    return [scope, {
      subtitle: `${config.grants} Grant ID đang có quyền gọi API thuộc scope ${scope}`,
      metrics: scope === "QRPay"
        ? [
          { label: "Grant đang hoạt động", value: config.active, change: "+6.8%", unit: "" },
          { label: "Số lượng giao dịch", value: "132.400", change: "+8.6%", unit: "" },
          { label: "Tổng tiền giao dịch", value: "12.486.750.000", change: "+10.4%", unit: "đ" },
          { label: "Chi phí QRPay", value: config.cost, change: "+8.9%", unit: "đ" },
        ]
        : scope === "VirtualAccount"
          ? [
            { label: "Grant đang hoạt động", value: config.active, change: "+6.8%", unit: "" },
            { label: "Số lượng VA hoạt động", value: "1.520", change: "+12.4%", unit: "" },
            { label: "Số lượng VA tạo mới", value: "184", change: "+15.2%", unit: "" },
            { label: "Chi phí VA", value: config.cost, change: "+8.9%", unit: "đ" },
          ]
          : scope === "BalanceHook"
            ? [
              { label: "Grant đang hoạt động", value: config.active, change: "+6.8%", unit: "" },
              { label: "Số lượng giao dịch", value: "281.400", change: "+9.7%", unit: "" },
              { label: "Tổng tiền giao dịch", value: "45.820.000.000", change: "+14.2%", unit: "đ" },
              { label: "Chi phí", value: config.cost, change: "+8.9%", unit: "đ" },
            ]
            : scope === "Transfer"
              ? [
                { label: "Grant đang hoạt động", value: config.active, change: "+6.8%", unit: "" },
                { label: "Số lượng giao dịch", value: "108.200", change: "+9.7%", unit: "" },
                { label: "Tổng tiền giao dịch", value: "82.650.000.000", change: "+16.8%", unit: "đ" },
                { label: "Chi phí", value: config.cost, change: "+8.9%", unit: "đ" },
              ]
              : scope === "Transaction"
                ? [
                  { label: "Grant đang hoạt động", value: "62", change: "+4.2%", unit: "" },
                  { label: "Chi phí Grant", value: "6.200.000", change: "+4.2%", unit: "đ" },
                  { label: "Request thành công", value: config.calls, change: "+9.7%", unit: "" },
                  { label: "Chi phí Request", value: "12.804.000", change: "+9.7%", unit: "đ" },
                ]
                : [
                  { label: `Grant ${scope} đang hoạt động`, value: config.grants, change: "+6.8%", unit: "grant" },
                  { label: "Chi phí Grant", value: config.costGrants, change: "+4.2%", unit: "đ" },
                  { label: "API calls", value: config.calls, change: "+9.7%", unit: scopeUnits[scope] || "calls" },
                  { label: `Chi phí ${scope}`, value: config.cost, change: "+8.9%", unit: "đ" },
                ],
      rows: buildScopeRows(scope),
      hasWebhook: config.webhook,
    }];
  })) as Record<Exclude<AnalyticsTab, "Connection">, {
    subtitle: string;
    metrics: { label: string; value: string; change?: string; tone?: string; unit?: string }[];
    rows: DetailRow[];
    hasWebhook?: boolean;
  }>,
  Deeplink: {
    subtitle: "Thống kê lượt khởi tạo và chuyển hướng Deeplink tới ứng dụng ngân hàng",
    metrics: [
      { label: "Số lượng ngân hàng", value: "12", change: "+4.2%", unit: "" },
      { label: "Số lượng giao dịch", value: "115.400", change: "+14.2%", unit: "" },
      { label: "Tổng tiền giao dịch", value: "48.250.000.000 VNĐ", change: "+18.5%" },
      { label: "Chi phí", value: "11.540.000 VNĐ", change: "+12.1%" }
    ],
    rows: buildScopeRows("Deeplink"),
  },
};

const screenData: Record<string, { description: string; action: string; columns: string[]; rows: string[][] }> = {
  "API keys": { description: "Client ID và Secret key dùng để xác thực App.", action: "Tìm hiểu thêm", columns: [], rows: [] },
  API: { description: "Danh sách URL nhận kết quả sau khi end-user cấp quyền thành công.", action: "Tìm hiểu thêm", columns: [], rows: [] },
  Webhooks: { description: "Endpoint nhận sự kiện Grant, Transaction, QRPay và VirtualAccount.", action: "Thêm webhook", columns: [], rows: [] },
  Logs: { description: "Lịch sử request API và webhook của App.", action: "Export logs", columns: ["Request ID", "Endpoint / Event", "Scope", "Grant ID", "HTTP"], rows: [["req_7KQ2M91P", "/v2/transactions", "Transaction", "grt_8L2KP91N", "200"], ["req_4PX9D20A", "/v2/balance", "Balance", "grt_4T7MD20Q", "200"], ["wh_1MV3C84F", "payment.succeeded", "QRPay webhook", "grt_1A9HC63V", "200"], ["wh_8AB5R72W", "va.credited", "VirtualAccount webhook", "grt_6P3RF82K", "429"]] },
  Grants: { description: "Tổng hợp Grant ID, ngân hàng và các scope đã được cấp.", action: "Tạo connection", columns: ["Grant ID", "End-user", "Ngân hàng", "Scopes được cấp", "Trạng thái"], rows: baseRows.map(r => [r.grant, r.user, r.bank, r.scopes, r.status]) },
  Usage: { description: "Theo dõi Grant, API usage và chi phí theo từng nghiệp vụ.", action: "Tải hoá đơn", columns: ["Scope", "Grant có quyền", "API calls", "Chi phí", "Trạng thái"], rows: (Object.keys(scopeConfig) as Exclude<AnalyticsTab, "Connection">[]).map(scope => [scope, scopeConfig[scope].grants, scopeConfig[scope].calls, scopeConfig[scope].cost, "Active"]) },
  "Grant debugger": { description: "Kiểm tra trạng thái và quyền của một Grant.", action: "Chạy kiểm tra", columns: ["Grant ID gần đây", "Ngân hàng", "Scopes", "Hết hạn", "Trạng thái"], rows: [["grt_8L2KP91N", "Techcombank", "identity, balance, transaction", "24/10/2026", "Healthy"], ["grt_4T7MD20Q", "Vietcombank", "balance, transaction", "02/11/2026", "Healthy"], ["grt_1A9HC63V", "MB Bank", "identity, qrpay", "28/07/2026", "Expiring"]] },
  "Cài đặt App": { description: "Thông tin và callback URL của App.", action: "Lưu thay đổi", columns: ["Cấu hình", "Giá trị", "Môi trường", "Cập nhật", "Trạng thái"], rows: [["App ID", "app_8F2KD91M", "—", "Không đổi", "Active"], ["Redirect URI", "bankhub.vn/cas/callback", "Production", "19/07/2026", "Verified"], ["Allowed origin", "https://bankhub.vn", "Production", "19/07/2026", "Verified"]] },
  "Thành viên": { description: "Quản lý quyền truy cập App.", action: "Mời thành viên", columns: ["Thành viên", "Email", "Vai trò", "Truy cập gần nhất", "Trạng thái"], rows: [["Minh Nguyễn", "minh@vietfin.vn", "Owner", "Vừa xong", "Active"], ["Linh Phạm", "linh@vietfin.vn", "Developer", "2 giờ trước", "Active"], ["Huy Trần", "huy@vietfin.vn", "Analyst", "Hôm qua", "Active"]] },
};

const monthChartValues = [34, 39, 37, 45, 42, 49, 47, 52, 50, 57, 54, 61, 59, 64, 62, 69, 66, 72, 70, 76, 73, 81, 78, 84, 82, 88, 85, 91, 89, 94, 92];
const grantNewDaily = [3, 4, 3, 5, 4, 6, 5, 5, 4, 7, 5, 6, 5, 7, 5, 8, 6, 5, 7, 6, 8, 5, 7, 6, 9, 7, 6, 8, 7, 9, 6];
const grantPausedDeletedDaily = [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 1, 0, 1, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 1, 0];
const visibleUsageTabs: AnalyticsTab[] = ["Transaction", "QRPay", "VirtualAccount", "BalanceHook", "Transfer", "Deeplink"];

function usageTabLabel(tab: AnalyticsTab) {
  if (tab === "Connection") return "Grant";
  if (tab === "VirtualAccount") return "Virtual Account";
  if (tab === "BalanceHook") return "Balance Hook";
  if (tab === "Deeplink") return "Deeplink";
  return tab;
}

function KpiValue({ value, unit }: { value: string; unit?: string }) {
  const isMoney = value.endsWith(" VNĐ");
  const displayVal = isMoney ? value.slice(0, -4) : value;
  const displayUnit = isMoney ? "đ" : unit;
  return <>{displayVal}{displayUnit && <i className="kpi-unit">{displayUnit}</i>}</>;
}

function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
  size = "md",
  className = "",
  autoFocus,
  disabled
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      className={`custom-input input-${size} ${className}`}
    />
  );
}

function FormSelect({
  value,
  onChange,
  options,
  size = "md",
  className = ""
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[] | string[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={`custom-select-wrap select-${size} ${className}`}>
      <select value={value} onChange={onChange} className="custom-select">
        {options.map(opt => typeof opt === "string" ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="select-arrow">⌄</span>
    </div>
  );
}

function FormButton({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  type = "button",
  disabled,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button btn-${variant} btn-${size} ${className}`}
    >
      {children}
    </button>
  );
}

function CredentialBox({
  value,
  maskedValue,
  label,
  showToggle,
  isShowing,
  onToggle,
  onCopy,
  onRotate,
  note
}: {
  value: string;
  maskedValue?: string;
  label: string;
  showToggle?: boolean;
  isShowing?: boolean;
  onToggle?: () => void;
  onCopy: () => void;
  onRotate?: () => void;
  note?: string;
}) {
  const displayVal = showToggle && !isShowing ? (maskedValue || "••••••••••••••••••••••••••••••••") : value;
  return (
    <div className="credential-box-wrap">
      <div className="credential-field">
        <code>{displayVal}</code>
        <div className="credential-actions">
          {showToggle && (
            <button type="button" onClick={onToggle} title={isShowing ? "Ẩn giá trị" : "Hiện giá trị"}>
              {isShowing ? "Ẩn" : "Hiện"}
            </button>
          )}
          <button type="button" onClick={onCopy} title={`Sao chép ${label}`}>
            ▣ Sao chép
          </button>
          {onRotate && (
            <button type="button" className="btn-rotate" onClick={onRotate} title="Rotate secret key mới">
              ↻ Rotate
            </button>
          )}
        </div>
      </div>
      {note && <small className="field-note">{note}</small>}
    </div>
  );
}

const usageTableData: Record<AnalyticsTab, { title: string; columns: string[]; rows: string[][] }> = {
  Connection: {
    title: "Danh sách",
    columns: ["STT", "Grant ID", "Loại", "Họ và tên", "CCCD", "Tên doanh nghiệp", "MST", "Số điện thoại", "Dịch vụ tài chính", "Tài khoản", "Scope", "Ngày tạo", "Trạng thái"],
    rows: [
      ["1", "grt_8L2KP91N", "Cá nhân", "Nguyễn Minh Anh", "079204••••12", "—", "—", "0903 482 716", "Techcombank QR Pay", "1903 •••• 4812", "Transaction, Balance, Identity", "24/07/2026 16:42", "Accepted"],
      ["2", "grt_4T7MD20Q", "Tổ chức", "Lê Hoàng Minh", "079185••••39", "Công ty CP Minh Long", "0317849201", "028 7308 2268", "Vietcombank One QR", "1028 •••• 1098", "Transaction, Balance, QRPay", "24/07/2026 15:28", "New"],
      ["3", "grt_1A9HC63V", "Cá nhân", "Phạm Thùy Linh", "001198••••45", "—", "—", "0988 214 650", "MB Bank API", "0681 •••• 6721", "Identity, eKYC", "24/07/2026 14:17", "Paused"],
      ["4", "grt_6P3RF82K", "Tổ chức", "Đỗ Tuấn Nam", "001192••••18", "Công ty TNHH Nam Việt", "0109384612", "024 6682 0911", "ACB", "2167 •••• 3306", "VirtualAccount, Invoice", "23/07/2026 17:03", "Deleted"],
      ["5", "grt_2K8NP14D", "Cá nhân", "Trần Hoàng Long", "079195••••81", "—", "—", "0912 650 428", "BIDV", "2111 •••• 9024", "Transaction, Transfer", "23/07/2026 11:46", "Accepted"],
      ["6", "grt_9Q4LC73A", "Tổ chức", "Vũ Thanh Hằng", "001187••••62", "Công ty CP Nova Retail", "0318291740", "028 3939 1166", "Sacombank", "0602 •••• 2180", "QRPay, VirtualAccount", "22/07/2026 09:34", "Accepted"],
      ["7", "grt_5M3KP82N", "Cá nhân", "Nguyễn Văn Đức", "079201••••55", "—", "—", "0908 123 987", "VietinBank API", "1018 •••• 5541", "Transaction, QRPay", "21/07/2026 18:20", "Accepted"],
      ["8", "grt_7B9RT14H", "Tổ chức", "Hoàng Ngọc Sơn", "036190••••88", "Công ty CP Trường Sơn", "0108920194", "024 3821 7789", "Techcombank", "1902 •••• 8812", "VirtualAccount, Transfer", "21/07/2026 14:05", "Accepted"],
      ["9", "grt_3C8VL90P", "Cá nhân", "Trịnh Bảo Ngọc", "001199••••34", "—", "—", "0934 567 890", "VPBank", "1542 •••• 9901", "Transaction, Balance", "20/07/2026 11:15", "Paused"],
      ["10", "grt_9X2NY55T", "Tổ chức", "Phan Thanh Tùng", "079188••••77", "Công ty TNHH Sài Gòn Tech", "0316543210", "028 3822 9900", "Vietcombank", "1019 •••• 3342", "QRPay, BalanceHook", "20/07/2026 08:50", "Accepted"],
      ["11", "grt_1L8QP42K", "Cá nhân", "Vũ Thu Trang", "001196••••21", "—", "—", "0977 888 999", "TPBank", "0219 •••• 4410", "Transaction, QRPay", "19/07/2026 16:40", "Accepted"],
      ["12", "grt_6K4FD19M", "Tổ chức", "Đặng Quốc Huy", "079193••••14", "Công ty CP Hoàng Gia", "0319087654", "028 7300 1122", "BIDV", "2151 •••• 6678", "Transfer, VirtualAccount", "19/07/2026 10:12", "New"],
      ["13", "grt_8P9WX33L", "Cá nhân", "Bùi Mỹ Linh", "036200••••90", "—", "—", "0918 333 444", "Techcombank", "1903 •••• 1129", "QRPay, BalanceHook", "18/07/2026 15:30", "Accepted"],
      ["14", "grt_2M7VT88D", "Tổ chức", "Nguyễn Thái Dương", "001191••••63", "Công ty TNHH Á Châu", "0107654321", "024 3942 5566", "MB Bank", "0682 •••• 9988", "Transaction, Balance", "18/07/2026 09:05", "Accepted"],
      ["15", "grt_4H9BN11Q", "Cá nhân", "Lý Kim Ngân", "079203••••47", "—", "—", "0909 666 777", "Sacombank", "0603 •••• 7712", "Transaction, Transfer", "17/07/2026 14:22", "Accepted"],
    ],
  },
  Transaction: {
    title: "Danh sách",
    columns: ["STT", "Request ID", "Grant ID", "Ngân hàng", "Số tài khoản", "Từ ngày", "Đến ngày", "Trạng thái", "Tốc độ", "Thời gian gọi"],
    rows: [
      ["1", "req_TRX84291", "grt_8L2KP91N", "Techcombank", "1903 •••• 4812", "01/07/2026", "24/07/2026", "Success", "0.5s", "24/07/2026 17:04:28"],
      ["2", "req_TRX84154", "grt_4T7MD20Q", "Vietcombank", "1028 •••• 1098", "15/07/2026", "24/07/2026", "Success", "0.8s", "24/07/2026 16:42:11"],
      ["3", "req_TRX84017", "grt_1A9HC63V", "MB Bank", "0681 •••• 6721", "01/06/2026", "30/06/2026", "Failed", "1.2s", "24/07/2026 15:18:46"],
      ["4", "req_TRX83880", "grt_6P3RF82K", "ACB", "2167 •••• 3306", "20/07/2026", "24/07/2026", "Success", "0.6s", "24/07/2026 14:09:35"],
      ["5", "req_TRX83743", "grt_2K8NP14D", "BIDV", "2111 •••• 9024", "01/07/2026", "24/07/2026", "Success", "1.0s", "24/07/2026 13:45:09"],
      ["6", "req_TRX83606", "grt_9Q4LC73A", "Sacombank", "0602 •••• 2180", "23/07/2026", "24/07/2026", "Success", "2.4s", "24/07/2026 13:28:52"],
      ["7", "req_TRX83469", "grt_5M3KP82N", "VietinBank", "1018 •••• 5541", "01/07/2026", "23/07/2026", "Success", "0.7s", "23/07/2026 18:50:12"],
      ["8", "req_TRX83332", "grt_7B9RT14H", "Techcombank", "1902 •••• 8812", "10/07/2026", "23/07/2026", "Success", "0.9s", "23/07/2026 16:15:30"],
      ["9", "req_TRX83195", "grt_3C8VL90P", "VPBank", "1542 •••• 9901", "01/07/2026", "22/07/2026", "Failed", "1.8s", "23/07/2026 11:05:44"],
      ["10", "req_TRX83058", "grt_9X2NY55T", "Vietcombank", "1019 •••• 3342", "15/07/2026", "22/07/2026", "Success", "0.4s", "22/07/2026 17:30:19"],
      ["11", "req_TRX82921", "grt_1L8QP42K", "TPBank", "0219 •••• 4410", "01/07/2026", "22/07/2026", "Success", "0.6s", "22/07/2026 14:12:05"],
      ["12", "req_TRX82784", "grt_6K4FD19M", "BIDV", "2151 •••• 6678", "01/07/2026", "21/07/2026", "Success", "1.1s", "21/07/2026 19:08:42"],
      ["13", "req_TRX82647", "grt_8P9WX33L", "Techcombank", "1903 •••• 1129", "05/07/2026", "21/07/2026", "Success", "0.5s", "21/07/2026 15:44:20"],
      ["14", "req_TRX82510", "grt_2M7VT88D", "MB Bank", "0682 •••• 9988", "01/07/2026", "20/07/2026", "Success", "0.8s", "20/07/2026 10:22:15"],
      ["15", "req_TRX82373", "grt_4H9BN11Q", "Sacombank", "0603 •••• 7712", "01/07/2026", "20/07/2026", "Success", "1.5s", "20/07/2026 08:50:33"],
    ],
  },
  Identity: {
    title: "Lịch sử truy vấn định danh",
    columns: ["Request ID", "Grant ID", "Người dùng", "Ngân hàng", "Thông tin truy vấn", "Kết quả", "Thời gian"],
    rows: [
      ["req_IDE84291", "grt_8L2KP91N", "Nguyễn Minh Anh", "Techcombank", "Họ tên, CCCD, ngày sinh", "Success", "24/07 · 16:58"],
      ["req_IDE84154", "grt_4T7MD20Q", "Công ty CP Minh Long", "Vietcombank", "Tên pháp lý, MST, đại diện", "Success", "24/07 · 16:21"],
      ["req_IDE84017", "grt_1A9HC63V", "Phạm Thùy Linh", "MB Bank", "Họ tên, CCCD", "Failed", "24/07 · 15:37"],
      ["req_IDE83880", "grt_2K8NP14D", "Trần Hoàng Long", "BIDV", "Họ tên, số điện thoại", "Success", "24/07 · 14:45"],
    ],
  },
  Balance: {
    title: "Lịch sử truy vấn số dư",
    columns: ["Request ID", "Grant ID", "Ngân hàng / Tài khoản", "Số dư khả dụng", "Tiền tệ", "Trạng thái", "Cập nhật"],
    rows: [
      ["req_BAL84291", "grt_8L2KP91N", "Techcombank · •• 4812", "₫48,250,000", "VND", "Success", "24/07 · 16:42"],
      ["req_BAL84154", "grt_4T7MD20Q", "Vietcombank · •• 1098", "₫126,840,500", "VND", "Success", "24/07 · 16:18"],
      ["req_BAL84017", "grt_1A9HC63V", "MB Bank · •• 6721", "—", "VND", "Failed", "24/07 · 15:31"],
      ["req_BAL83880", "grt_6P3RF82K", "ACB · •• 3306", "₫82,410,200", "VND", "Success", "24/07 · 14:57"],
    ],
  },
  QRPay: {
    title: "Danh sách",
    columns: ["STT", "QR ID", "Grant ID", "Reference", "Transaction", "Ngân hàng", "STK", "Tên người nhận", "Số tiền", "Nội dung", "Thông báo", "Thời gian"],
    rows: [
      ["1", "qr_M20P81", "grt_8L2KP91N", "FT260724163218", "BH10428", "Techcombank", "1903 •••• 4812", "Nguyễn Minh Anh", "₫125,000", "Order BH-10428", "Delivered", "24/07/2026 16:32:18"],
      ["2", "qr_Q47D20", "grt_4T7MD20Q", "FT260724160542", "INV20261842", "Vietcombank", "1028 •••• 1098", "Công ty CP Minh Long", "₫2,480,000", "INV-2026-1842", "Delivered", "24/07/2026 16:05:42"],
      ["3", "qr_A19C63", "grt_9Q4LC73A", "FT260724154209", "POSNR02814", "Sacombank", "0602 •••• 2180", "Công ty CP Nova Retail", "₫845,000", "POS-NR-02814", "Delivered", "24/07/2026 15:42:09"],
      ["4", "qr_W63F82", "grt_6P3RF82K", "FT260724145633", "HD0726091", "ACB", "2167 •••• 3306", "Công ty TNHH Nam Việt", "₫6,200,000", "HD-0726-091", "Failed", "24/07/2026 14:56:33"],
      ["5", "qr_D28P14", "grt_2K8NP14D", "FT260724132851", "ORDER8421", "BIDV", "2111 •••• 9024", "Trần Hoàng Long", "₫320,000", "Thanh toán đơn 8421", "Delivered", "24/07/2026 13:28:51"],
      ["6", "qr_K82V90", "grt_5M3KP82N", "FT260724121540", "BH10429", "VietinBank", "1018 •••• 5541", "Nguyễn Văn Đức", "₫1,500,000", "Order BH-10429", "Delivered", "24/07/2026 12:15:40"],
      ["7", "qr_P19L44", "grt_7B9RT14H", "FT260724110822", "INV20261901", "Techcombank", "1902 •••• 8812", "Hoàng Ngọc Sơn", "₫4,800,000", "INV-2026-1901", "Delivered", "24/07/2026 11:08:22"],
      ["8", "qr_X54M12", "grt_3C8VL90P", "FT260724103015", "POSNR02815", "VPBank", "1542 •••• 9901", "Trịnh Bảo Ngọc", "₫750,000", "POS-NR-02815", "Delivered", "24/07/2026 10:30:15"],
      ["9", "qr_T88K99", "grt_9X2NY55T", "FT260724094508", "ORDER8422", "Vietcombank", "1019 •••• 3342", "Phan Thanh Tùng", "₫980,000", "Thanh toán đơn 8422", "Retrying", "24/07/2026 09:45:08"],
      ["10", "qr_Z12N45", "grt_1L8QP42K", "FT260724085033", "HD0726092", "TPBank", "0219 •••• 4410", "Vũ Thu Trang", "₫3,400,000", "HD-0726-092", "Delivered", "24/07/2026 08:50:33"],
      ["11", "qr_R90P66", "grt_6K4FD19M", "FT260723182010", "BH10430", "BIDV", "2151 •••• 6678", "Đặng Quốc Huy", "₫12,000,000", "Order BH-10430", "Delivered", "23/07/2026 18:20:10"],
      ["12", "qr_B44L21", "grt_8P9WX33L", "FT260723171245", "INV20261902", "Techcombank", "1903 •••• 1129", "Bùi Mỹ Linh", "₫540,000", "INV-2026-1902", "Delivered", "23/07/2026 17:12:45"],
      ["13", "qr_C77V88", "grt_2M7VT88D", "FT260723160530", "POSNR02816", "MB Bank", "0682 •••• 9988", "Nguyễn Thái Dương", "₫2,150,000", "POS-NR-02816", "Delivered", "23/07/2026 16:05:30"],
      ["14", "qr_H11K33", "grt_4H9BN11Q", "FT260723145012", "ORDER8423", "Sacombank", "0603 •••• 7712", "Lý Kim Ngân", "₫8,900,000", "Thanh toán đơn 8423", "Failed", "23/07/2026 14:50:12"],
      ["15", "qr_Y99M54", "grt_8L2KP91N", "FT260723131804", "HD0726093", "Techcombank", "1903 •••• 4812", "Nguyễn Minh Anh", "₫670,000", "HD-0726-093", "Delivered", "23/07/2026 13:18:04"],
    ],
  },
  VirtualAccount: {
    title: "Danh sách",
    columns: ["STT", "VA ID", "Grant ID", "Ngân hàng", "Tên tài khoản", "STK gốc", "Tên VA", "VA", "Trạng thái", "Ngày tạo"],
    rows: [
      ["1", "va_98681200", "grt_6P3RF82K", "ACB", "CTY TNHH NAM VIET", "2167 •••• 3306", "VA Thanh toan Nam Viet", "9868120001842", "Active", "23/07/2026 17:03"],
      ["2", "va_97043600", "grt_9Q4LC73A", "Vietcombank", "CTY CP NOVA RETAIL", "1028 •••• 1098", "VA Nova Store HCM", "9704360028471", "Active", "22/07/2026 09:34"],
      ["3", "va_19036900", "grt_4T7MD20Q", "Techcombank", "CTY CP MINH LONG", "1903 •••• 4812", "VA Thu ho Minh Long", "1903690015820", "Paused", "20/07/2026 14:15"],
      ["4", "va_12891000", "grt_8L2KP91N", "BIDV", "NGUYEN MINH ANH", "2111 •••• 9024", "VA Minh Anh Personal", "1289100042763", "Inactive", "18/07/2026 11:20"],
      ["5", "va_99018200", "grt_1A9HC63V", "MB Bank", "PHAM THUY LINH", "0681 •••• 6721", "VA Linh Pham Store", "9901820038194", "Active", "15/07/2026 08:45"],
      ["6", "va_96024100", "grt_2K8NP14D", "Sacombank", "TRAN HOANG LONG", "0602 •••• 2180", "VA Long Tran Online", "9602410082736", "Active", "12/07/2026 16:30"],
      ["7", "va_96881000", "grt_5M3KP82N", "VietinBank", "NGUYEN VAN DUC", "1018 •••• 5541", "VA Van Duc Trading", "9688100055410", "Active", "10/07/2026 14:10"],
      ["8", "va_19038800", "grt_7B9RT14H", "Techcombank", "CTY CP TRUONG SON", "1902 •••• 8812", "VA Thu ho Truong Son", "1903880088120", "Active", "08/07/2026 09:25"],
      ["9", "va_98421500", "grt_3C8VL90P", "VPBank", "TRINH BAO NGOC", "1542 •••• 9901", "VA Ngoc Trinh Shop", "9842150099015", "Paused", "05/07/2026 16:40"],
      ["10", "va_97041900", "grt_9X2NY55T", "Vietcombank", "CTY TNHH SAI GON TECH", "1019 •••• 3342", "VA Saigon Tech Main", "9704190033421", "Active", "03/07/2026 11:15"],
      ["11", "va_92190000", "grt_1L8QP42K", "TPBank", "VU THU TRANG", "0219 •••• 4410", "VA Thu Trang Fashion", "9219000044102", "Active", "01/07/2026 15:50"],
      ["12", "va_12892100", "grt_6K4FD19M", "BIDV", "CTY CP HOANG GIA", "2151 •••• 6678", "VA Hoang Gia B2B", "1289210066789", "Active", "28/06/2026 10:05"],
      ["13", "va_19031100", "grt_8P9WX33L", "Techcombank", "BUI MY LINH", "1903 •••• 1129", "VA My Linh Studio", "1903110011299", "Active", "25/06/2026 17:35"],
      ["14", "va_99010600", "grt_2M7VT88D", "MB Bank", "CTY TNHH A CHAU", "0682 •••• 9988", "VA A Chau Logistics", "9901060099884", "Active", "22/06/2026 08:50"],
      ["15", "va_96020600", "grt_4H9BN11Q", "Sacombank", "LY KIM NGAN", "0603 •••• 7712", "VA Kim Ngan Jewelry", "9602060077123", "Active", "20/06/2026 13:15"],
    ],
  },
  BalanceHook: {
    title: "Danh sách",
    columns: ["STT", "Txn ID", "GrantID", "Reference", "Transaction", "Ngân hàng", "Số tài khoản", "Tên tài khoản", "Số tiền", "Nội dung", "Thông báo", "Thời gian"],
    rows: [
      ["1", "txn_981240", "grt_8L2KP91N", "FT260724164210", "BH20481", "Techcombank", "1903 •••• 4812", "Nguyễn Minh Anh", "+₫482,500", "Tiền vào: Nhan thanh toan BH20481", "Delivered", "24/07/2026 16:42:10"],
      ["2", "txn_981239", "grt_4T7MD20Q", "FT260724161825", "INV20261902", "Vietcombank", "1028 •••• 1098", "Công ty CP Minh Long", "-₫12,650,000", "Tiền ra: Thanh toan phi dich vu VCB", "Delivered", "24/07/2026 16:18:25"],
      ["3", "txn_981238", "grt_1A9HC63V", "FT260724153108", "POSMB9812", "MB Bank", "0681 •••• 6721", "Phạm Thùy Linh", "+₫3,200,000", "Tiền vào: Cong tien QR thanh toan", "Failed", "24/07/2026 15:31:08"],
      ["4", "txn_981237", "grt_6P3RF82K", "FT260724145742", "HD0726105", "ACB", "2167 •••• 3306", "Công ty TNHH Nam Việt", "-₫8,400,000", "Tiền ra: Rut tien ve tai khoan chinh", "Delivered", "24/07/2026 14:57:42"],
      ["5", "txn_981236", "grt_2K8NP14D", "FT260724134519", "ORDER9014", "BIDV", "2111 •••• 9024", "Trần Hoàng Long", "+₫1,500,000", "Tiền vào: Chuyen khoan tu BIDV", "Delivered", "24/07/2026 13:45:19"],
      ["6", "txn_981235", "grt_9Q4LC73A", "FT260724132804", "POSNR0391", "Sacombank", "0602 •••• 2180", "Công ty CP Nova Retail", "-₫15,800,000", "Tiền ra: Chi tra tien hang STB 0602", "Retrying", "24/07/2026 13:28:04"],
      ["7", "txn_981234", "grt_5M3KP82N", "FT260724121005", "BH20482", "VietinBank", "1018 •••• 5541", "Nguyễn Văn Đức", "+₫4,250,000", "Tiền vào: Nhan tien thanh toan BH20482", "Delivered", "24/07/2026 12:10:05"],
      ["8", "txn_981233", "grt_7B9RT14H", "FT260724110540", "INV20261903", "Techcombank", "1902 •••• 8812", "Hoàng Ngọc Sơn", "-₫2,100,000", "Tiền ra: Chuyen tien NCC Truong Son", "Delivered", "24/07/2026 11:05:40"],
      ["9", "txn_981232", "grt_3C8VL90P", "FT260724102018", "POSVP8812", "VPBank", "1542 •••• 9901", "Trịnh Bảo Ngọc", "+₫890,000", "Tiền vào: Thu ho tin dung VPBank", "Delivered", "24/07/2026 10:20:18"],
      ["10", "txn_981231", "grt_9X2NY55T", "FT260724093550", "HD0726106", "Vietcombank", "1019 •••• 3342", "Phan Thanh Tùng", "-₫6,400,000", "Tiền ra: Thanh toan HD-0726-106", "Delivered", "24/07/2026 09:35:50"],
      ["11", "txn_981230", "grt_1L8QP42K", "FT260724084215", "BH20483", "TPBank", "0219 •••• 4410", "Vũ Thu Trang", "+₫18,200,000", "Tiền vào: Nhan chuyen khoan lon TPB", "Delivered", "24/07/2026 08:42:15"],
      ["12", "txn_981229", "grt_6K4FD19M", "FT260723185030", "INV20261904", "BIDV", "2151 •••• 6678", "Đặng Quốc Huy", "-₫1,150,000", "Tiền ra: Phi duy tri tai khoan BIDV", "Delivered", "23/07/2026 18:50:30"],
      ["13", "txn_981228", "grt_8P9WX33L", "FT260723172210", "POSMB9813", "Techcombank", "1903 •••• 1129", "Bùi Mỹ Linh", "+₫7,500,000", "Tiền vào: Nhan tien dat coc studio", "Delivered", "23/07/2026 17:22:10"],
      ["14", "txn_981227", "grt_2M7VT88D", "FT260723161045", "HD0726107", "MB Bank", "0682 •••• 9988", "Nguyễn Thái Dương", "-₫3,800,000", "Tiền ra: Chuyen tien thanh toan HD107", "Failed", "23/07/2026 16:10:45"],
      ["15", "txn_981226", "grt_4H9BN11Q", "FT260723145520", "ORDER9015", "Sacombank", "0603 •••• 7712", "Lý Kim Ngân", "+₫12,400,000", "Tiền vào: Nhan tien thanh toan don 9015", "Delivered", "23/07/2026 14:55:20"],
    ],
  },
  Transfer: {
    title: "Danh sách",
    columns: ["STT", "transaction id", "grantID", "Reference", "Ngân hàng gửi", "Tên người gửi", "STK gửi", "Ngân hàng nhận", "Tên người nhận", "STK nhận", "Số tiền", "Nội dung", "Trạng thái", "Thời gian"],
    rows: [
      ["1", "trf_82MP91", "grt_2K8NP14D", "FT260724161208", "BIDV", "Trần Hoàng Long", "2111 •••• 9024", "Techcombank", "Nguyễn Minh Anh", "1903 •••• 4812", "₫5,200,000", "Thanh toan hop dong 1842", "Success", "24/07/2026 16:12:08"],
      ["2", "trf_47QD20", "grt_8L2KP91N", "FT260724154832", "Techcombank", "Nguyễn Minh Anh", "1903 •••• 4812", "Vietcombank", "Công ty CP Minh Long", "1028 •••• 1098", "₫18,400,000", "Thanh toan hoa don INV-841", "Processing", "24/07/2026 15:48:32"],
      ["3", "trf_19VC63", "grt_4T7MD20Q", "FT260724150719", "Vietcombank", "Công ty CP Minh Long", "1028 •••• 1098", "BIDV", "Trần Hoàng Long", "2111 •••• 9024", "₫2,100,000", "Hoan ung chi phi du lich", "Failed", "24/07/2026 15:07:19"],
      ["4", "trf_63RF82", "grt_6P3RF82K", "FT260724143340", "ACB", "Công ty TNHH Nam Việt", "2167 •••• 3306", "Sacombank", "Công ty CP Nova Retail", "0602 •••• 2180", "₫32,500,000", "Doi soat doanh thu 23/07", "Success", "24/07/2026 14:33:40"],
      ["5", "trf_94LC73", "grt_1A9HC63V", "FT260724131502", "MB Bank", "Phạm Thùy Linh", "0681 •••• 6721", "Techcombank", "Nguyễn Minh Anh", "1903 •••• 4812", "₫1,850,000", "Thanh toan don hang BH10429", "Success", "24/07/2026 13:15:02"],
      ["6", "trf_84291N", "grt_9Q4LC73A", "FT260724114255", "Sacombank", "Công ty CP Nova Retail", "0602 •••• 2180", "ACB", "Công ty TNHH Nam Việt", "2167 •••• 3306", "₫14,200,000", "Thanh toan tien nhap hang STB", "Success", "24/07/2026 11:42:55"],
      ["7", "trf_55MK32", "grt_5M3KP82N", "FT260724103010", "VietinBank", "Nguyễn Văn Đức", "1018 •••• 5541", "MB Bank", "Phạm Thùy Linh", "0681 •••• 6721", "₫6,800,000", "Chuyen tien tam ung du an", "Success", "24/07/2026 10:30:10"],
      ["8", "trf_77HS14", "grt_7B9RT14H", "FT260724091522", "Techcombank", "Hoàng Ngọc Sơn", "1902 •••• 8812", "BIDV", "Trần Hoàng Long", "2111 •••• 9024", "₫22,500,000", "Thanh toan hop dong 1908", "Success", "24/07/2026 09:15:22"],
      ["9", "trf_33BN90", "grt_3C8VL90P", "FT260724084005", "VPBank", "Trịnh Bảo Ngọc", "1542 •••• 9901", "Vietcombank", "Công ty CP Minh Long", "1028 •••• 1098", "₫3,400,000", "Thanh toan phi dich vu VPB", "Processing", "24/07/2026 08:40:05"],
      ["10", "trf_99TT55", "grt_9X2NY55T", "FT260723175040", "Vietcombank", "Phan Thanh Tùng", "1019 •••• 3342", "ACB", "Công ty TNHH Nam Việt", "2167 •••• 3306", "₫9,600,000", "Chuyen tien vat tu Saigon Tech", "Success", "23/07/2026 17:50:40"],
      ["11", "trf_11VT42", "grt_1L8QP42K", "FT260723162015", "TPBank", "Vũ Thu Trang", "0219 •••• 4410", "Techcombank", "Nguyễn Minh Anh", "1903 •••• 4812", "₫1,250,000", "Hoan tien don hang bi loi", "Success", "23/07/2026 16:20:15"],
      ["12", "trf_66QH19", "grt_6K4FD19M", "FT260723151030", "BIDV", "Đặng Quốc Huy", "2151 •••• 6678", "VietinBank", "Nguyễn Văn Đức", "1018 •••• 5541", "₫15,300,000", "Thanh toan hoa don Hoang Gia", "Failed", "23/07/2026 15:10:30"],
      ["13", "trf_88ML33", "grt_8P9WX33L", "FT260723140512", "Techcombank", "Bùi Mỹ Linh", "1903 •••• 1129", "Sacombank", "Công ty CP Nova Retail", "0602 •••• 2180", "₫4,700,000", "Thanh toan chi phi nhac kich", "Success", "23/07/2026 14:05:12"],
      ["14", "trf_22AD88", "grt_2M7VT88D", "FT260723113545", "MB Bank", "Nguyễn Thái Dương", "0682 •••• 9988", "BIDV", "Trần Hoàng Long", "2111 •••• 9024", "₫8,100,000", "Thanh toan cuoc van chuyen", "Success", "23/07/2026 11:35:45"],
      ["6", "trf_84291N", "grt_9Q4LC73A", "FT260724114255", "Sacombank", "Công ty CP Nova Retail", "0602 •••• 2180", "ACB", "Công ty TNHH Nam Việt", "2167 •••• 3306", "₫14,200,000", "Thanh toan tien nhap hang STB", "Success", "24/07/2026 11:42:55"],
    ],
  },
  eKYC: {
    title: "Phiên xác minh eKYC",
    columns: ["Session ID", "Grant ID", "Khách hàng", "Giấy tờ", "Face match", "Liveness", "Kết quả", "Hoàn tất"],
    rows: [
      ["ekyc_82MP91", "grt_8L2KP91N", "Nguyễn Minh Anh", "CCCD gắn chip", "98.7%", "Passed", "Verified", "24/07 · 16:08"],
      ["ekyc_47QD20", "grt_1A9HC63V", "Phạm Thùy Linh", "CCCD gắn chip", "96.2%", "Passed", "Verified", "24/07 · 15:22"],
      ["ekyc_19VC63", "grt_2K8NP14D", "Trần Hoàng Long", "Hộ chiếu", "72.4%", "Failed", "Rejected", "24/07 · 14:39"],
      ["ekyc_63RF82", "grt_4T7MD20Q", "Lê Hoàng Nam", "CCCD gắn chip", "—", "Processing", "Processing", "24/07 · 14:11"],
    ],
  },
  Invoice: {
    title: "Danh sách",
    columns: ["Invoice ID", "Grant ID", "Người mua", "MST", "Giá trị", "Ngày hoá đơn", "Trạng thái", "Cập nhật"],
    rows: [
      ["inv_2026_1842", "grt_4T7MD20Q", "Công ty CP Minh Long", "0317849201", "₫24,860,000", "24/07/2026", "Issued", "24/07 · 16:17"],
      ["inv_2026_1841", "grt_9Q4LC73A", "Công ty CP Nova Retail", "0318291740", "₫8,450,000", "24/07/2026", "Paid", "24/07 · 15:46"],
      ["inv_2026_1840", "grt_6P3RF82K", "Công ty TNHH Nam Việt", "0109384612", "₫62,000,000", "23/07/2026", "Issued", "24/07 · 14:58"],
      ["inv_2026_1839", "grt_8L2KP91N", "Nguyễn Minh Anh", "—", "₫1,250,000", "23/07/2026", "Cancelled", "24/07 · 13:20"],
    ],
  },
  Deeplink: {
    title: "Danh sách",
    columns: ["STT", "Request ID", "Ngân hàng", "Tên tài khoản", "Số tiền", "Nội dung", "Direct URL", "Status", "Ngày tạo"],
    rows: [
      ["1", "req_DLK98124", "Techcombank", "Nguyễn Minh Anh", "₫2,500,000", "Thanh toan don hang #10928", "https://dl.bankhub.dev/tcb/pay?id=98124", "Success", "24/07/2026 17:04:12"],
      ["2", "req_DLK98110", "Vietcombank", "Trần Hoàng Long", "₫1,200,000", "Chuyen tien hoc phi T7", "https://dl.bankhub.dev/vcb/pay?id=98110", "Success", "24/07/2026 16:45:08"],
      ["3", "req_DLK98095", "MB Bank", "Phạm Thùy Linh", "₫850,000", "Thanh toan ve may bay", "https://dl.bankhub.dev/mbb/pay?id=98095", "Success", "24/07/2026 15:30:22"],
      ["4", "req_DLK98082", "ACB", "Đỗ Tuấn Nam", "₫5,400,000", "Thanh toan hoa don dien nuoc", "https://dl.bankhub.dev/acb/pay?id=98082", "Failed", "24/07/2026 14:12:49"],
      ["5", "req_DLK98070", "BIDV", "Vũ Thu Trang", "₫3,100,000", "Nop tien tai khoan chung khoan", "https://dl.bankhub.dev/bidv/pay?id=98070", "Success", "24/07/2026 13:55:01"],
      ["6", "req_DLK98058", "Sacombank", "Đặng Quốc Huy", "₫750,000", "Thanh toan hop dong BH", "https://dl.bankhub.dev/stb/pay?id=98058", "Success", "24/07/2026 12:40:15"],
      ["7", "req_DLK98044", "VietinBank", "Bùi Mỹ Linh", "₫10,000,000", "Chuyen khoan dat coc hop dong", "https://dl.bankhub.dev/ctg/pay?id=98044", "Success", "24/07/2026 11:18:30"],
      ["8", "req_DLK98031", "VPBank", "Nguyễn Thái Dương", "₫420,000", "Thanh toan cuoc internet", "https://dl.bankhub.dev/vpb/pay?id=98031", "Success", "24/07/2026 10:05:40"],
      ["9", "req_DLK98019", "TPBank", "Lý Kim Ngân", "₫1,800,000", "Thanh toan don hang Tiki", "https://dl.bankhub.dev/tpb/pay?id=98019", "Failed", "24/07/2026 09:22:11"],
      ["10", "req_DLK98005", "Vietcombank", "Phan Thanh Tùng", "₫6,300,000", "Nop phi hop dong dich vu", "https://dl.bankhub.dev/vcb/pay?id=98005", "Success", "24/07/2026 08:45:00"],
      ["11", "req_DLK97992", "Techcombank", "Lê Hoàng Minh", "₫900,000", "Thanh toan phi dich vu SaaS", "https://dl.bankhub.dev/tcb/pay?id=97992", "Success", "23/07/2026 18:30:45"],
      ["12", "req_DLK97980", "MB Bank", "Nguyễn Minh Anh", "₫15,000,000", "Thanh toan tien thue nha T7", "https://dl.bankhub.dev/mbb/pay?id=97980", "Success", "23/07/2026 16:15:20"],
      ["13", "req_DLK97968", "BIDV", "Trần Hoàng Long", "₫2,100,000", "Chuyen tien mung sinh nhat", "https://dl.bankhub.dev/bidv/pay?id=97968", "Success", "23/07/2026 14:02:10"],
      ["14", "req_DLK97955", "ACB", "Phạm Thùy Linh", "₫3,750,000", "Thanh toan hoa don sieu thi", "https://dl.bankhub.dev/acb/pay?id=97955", "Success", "23/07/2026 11:40:05"],
      ["15", "req_DLK97942", "Sacombank", "Đỗ Tuấn Nam", "₫500,000", "Nap tien dien thoai", "https://dl.bankhub.dev/stb/pay?id=97942", "Success", "23/07/2026 09:10:30"],
    ],
  },
};

function usageStatuses(tab: AnalyticsTab) {
  const data = usageTableData[tab];
  const index = data.columns.findIndex(column => column.includes("Trạng thái") || column === "Kết quả");
  return index < 0 ? [] : [...new Set(data.rows.map(row => row[index]))];
}

const logRecords: LogRecord[] = [
  { requestId: "req_7qVUAW2ON3vx_hm9", method: "GET", endpoint: "/v2/transactions", scope: "Transaction", grantId: "grt_8L2KP91N", bank: "Techcombank", http: "200", latency: "284 ms", createdAt: "17:04:52 24/07/2026", requestBody: "{\n  \"from\": \"2026-07-01\",\n  \"to\": \"2026-07-24\",\n  \"page\": 1,\n  \"limit\": 50\n}", responseBody: "{\n  \"data\": {\n    \"transactions\": [\n      { \"id\": \"txn_82MP91\", \"amount\": 2450000, \"currency\": \"VND\" }\n    ],\n    \"total\": 128\n  }\n}" },
  { requestId: "req_OljkRZCSFR1cnaQW", method: "GET", endpoint: "/v2/balance", scope: "Balance", grantId: "grt_4T7MD20Q", bank: "Vietcombank", http: "200", latency: "326 ms", createdAt: "16:42:57 24/07/2026", requestBody: "{\n  \"accountId\": \"acc_4J8K2P\"\n}", responseBody: "{\n  \"data\": {\n    \"available\": 48250000,\n    \"current\": 49500000,\n    \"currency\": \"VND\"\n  }\n}" },
  { requestId: "req_L0rkB2btr5YGH806", method: "POST", endpoint: "/v2/transfers", scope: "Transfer", grantId: "grt_1A9HC63V", bank: "MB Bank", http: "400", latency: "412 ms", createdAt: "09:21:52 24/07/2026", requestBody: "{\n  \"amount\": -500000,\n  \"toAccount\": \"0123456789\",\n  \"description\": \"Thanh toan hoa don\"\n}", responseBody: "{\n  \"error\": {\n    \"code\": \"INVALID_AMOUNT\",\n    \"message\": \"amount must be greater than zero\",\n    \"field\": \"amount\"\n  }\n}" },
];

type ChartTimeRange = "24h" | "7d" | "jul26" | "jun26" | "may26";

function getChartData(tab: AnalyticsTab, range: ChartTimeRange) {
  const labelsMap: Record<AnalyticsTab, { title: string; primary: string; secondary: string; unit: string }> = {
    Connection: { title: "Grant thêm mới", primary: "Grant mới", secondary: "Pause / Delete", unit: "grant" },
    Transaction: { title: "Trạng thái Request", primary: "Request thành công", secondary: "Request thất bại", unit: "giao dịch" },
    QRPay: { title: "Trạng thái QR Pay", primary: "Thành công", secondary: "Thất bại", unit: "giao dịch" },
    VirtualAccount: { title: "Trạng thái Virtual Account", primary: "Hoạt động", secondary: "Ngừng hoạt động", unit: "giao dịch" },
    BalanceHook: { title: "Trạng thái Balance Hook", primary: "Thành công", secondary: "Thát bại", unit: "thông báo" },
    Transfer: { title: "Trạng thái Transfer", primary: "Thành công", secondary: "Thất bại", unit: "giao dịch" },
    Deeplink: { title: "Trạng thái Deeplink", primary: "Thành công", secondary: "Thất bại", unit: "lượt" },
    Identity: { title: "Trạng thái Identity", primary: "Thành công", secondary: "Lỗi", unit: "calls" },
    Balance: { title: "Trạng thái Balance", primary: "Thành công", secondary: "Lỗi", unit: "calls" },
    eKYC: { title: "Trạng thái eKYC", primary: "Thành công", secondary: "Lỗi", unit: "lượt" },
    Invoice: { title: "Trạng thái Invoice", primary: "Hợp lệ", secondary: "Hủy", unit: "hóa đơn" },
  };

  const meta = labelsMap[tab] || labelsMap.Transaction;

  let timeText = "";
  let xLabels: string[] = [];
  let primaryValues: number[] = [];
  let secondaryValues: number[] = [];
  let maxY = 100;

  if (range === "24h") {
    timeText = "24 giờ qua";
    maxY = tab === "Connection" ? 10 : 2500;
    xLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);
    if (tab === "Connection") {
      primaryValues = [1, 0, 0, 0, 1, 2, 4, 6, 8, 9, 7, 8, 6, 9, 8, 7, 9, 6, 5, 4, 3, 2, 1, 1];
      secondaryValues = [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0];
    } else {
      primaryValues = [120, 80, 45, 30, 90, 310, 850, 1420, 1890, 2100, 1950, 2240, 1800, 2350, 2120, 1980, 2050, 1750, 1320, 980, 750, 520, 340, 210];
      secondaryValues = [2, 1, 0, 0, 1, 4, 12, 24, 31, 38, 29, 35, 22, 41, 30, 25, 28, 20, 15, 10, 8, 5, 3, 2];
    }
  } else if (range === "7d") {
    timeText = "7 ngày qua (23/07–29/07)";
    maxY = tab === "Connection" ? 12 : 18000;
    xLabels = ["23/07", "24/07", "25/07", "26/07", "27/07", "28/07", "29/07"];
    if (tab === "Connection") {
      primaryValues = [6, 8, 7, 9, 7, 10, 8];
      secondaryValues = [1, 0, 1, 2, 0, 1, 1];
    } else {
      primaryValues = [12400, 14800, 13900, 16200, 15800, 17400, 16900];
      secondaryValues = [180, 220, 195, 240, 210, 260, 230];
    }
  } else if (range === "jun26") {
    timeText = "01/06–30/06/2026";
    maxY = tab === "Connection" ? 10 : 100;
    xLabels = Array.from({ length: 30 }, (_, i) => String(i + 1));
    if (tab === "Connection") {
      primaryValues = [2, 3, 4, 3, 5, 4, 6, 5, 4, 6, 5, 7, 6, 5, 7, 6, 8, 7, 6, 7, 6, 8, 7, 6, 7, 8, 6, 7, 6, 8];
      secondaryValues = [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    } else {
      primaryValues = [30, 35, 33, 40, 38, 44, 42, 48, 45, 52, 49, 56, 53, 59, 56, 62, 59, 65, 63, 68, 65, 72, 69, 75, 72, 79, 76, 82, 80, 85];
      secondaryValues = [2, 3, 2, 4, 3, 4, 3, 5, 4, 5, 4, 6, 5, 6, 5, 6, 5, 7, 6, 7, 6, 7, 6, 8, 7, 8, 7, 8, 7, 9];
    }
  } else if (range === "may26") {
    timeText = "01/05–31/05/2026";
    maxY = tab === "Connection" ? 10 : 100;
    xLabels = Array.from({ length: 31 }, (_, i) => String(i + 1));
    if (tab === "Connection") {
      primaryValues = [3, 2, 4, 3, 5, 4, 5, 6, 4, 5, 6, 5, 7, 6, 5, 7, 6, 7, 8, 6, 7, 6, 8, 7, 6, 8, 7, 6, 8, 7, 9];
      secondaryValues = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
    } else {
      primaryValues = [25, 28, 27, 32, 30, 36, 34, 40, 37, 43, 40, 47, 44, 50, 48, 54, 51, 57, 55, 60, 58, 64, 61, 67, 65, 71, 68, 74, 72, 78, 76];
      secondaryValues = [1, 2, 1, 3, 2, 3, 2, 4, 3, 4, 3, 5, 4, 5, 4, 5, 4, 6, 5, 6, 5, 6, 5, 7, 6, 7, 6, 7, 6, 8, 7];
    }
  } else {
    timeText = "01/07–31/07/2026";
    maxY = tab === "Connection" ? 10 : 100;
    xLabels = Array.from({ length: 31 }, (_, i) => String(i + 1));
    if (tab === "Connection") {
      primaryValues = [3, 4, 3, 5, 4, 6, 5, 5, 4, 7, 5, 6, 5, 7, 5, 8, 6, 5, 7, 6, 8, 5, 7, 6, 9, 7, 6, 8, 7, 9, 6];
      secondaryValues = [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 1, 0, 1, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 1, 0];
    } else {
      primaryValues = [34, 39, 37, 45, 42, 49, 47, 52, 50, 57, 54, 61, 59, 64, 62, 69, 66, 72, 70, 76, 73, 81, 78, 84, 82, 88, 85, 91, 89, 94, 92];
      secondaryValues = Array.from({ length: 31 }, (_, i) => 2 + (i % 4));
    }
  }

  return {
    title: `${meta.title} · ${timeText}`,
    primaryLabel: meta.primary,
    secondaryLabel: meta.secondary,
    unit: meta.unit,
    xLabels,
    primaryValues,
    secondaryValues,
    maxY,
  };
}

function getTabMetrics(tab: AnalyticsTab, range: ChartTimeRange) {
  const base = analyticsData[tab]?.metrics || analyticsData.Connection.metrics;
  if (range === "jul26") return base;

  if (range === "24h") {
    return base.map(m => {
      if (m.unit === "grant" || m.unit === "VA") return m;
      const valNum = parseInt(m.value.replace(/\./g, ""), 10);
      if (!isNaN(valNum) && valNum > 100) {
        const dailyVal = Math.round(valNum / 30);
        return { ...m, value: dailyVal.toLocaleString("vi-VN") };
      }
      return m;
    });
  }

  if (range === "7d") {
    return base.map(m => {
      if (m.unit === "grant" || m.unit === "VA") return m;
      const valNum = parseInt(m.value.replace(/\./g, ""), 10);
      if (!isNaN(valNum) && valNum > 100) {
        const weeklyVal = Math.round((valNum * 7) / 30);
        return { ...m, value: weeklyVal.toLocaleString("vi-VN") };
      }
      return m;
    });
  }

  if (range === "jun26") {
    return base.map(m => {
      const valNum = parseInt(m.value.replace(/\./g, ""), 10);
      if (!isNaN(valNum) && valNum > 50) {
        const juneVal = Math.round(valNum * 0.94);
        return { ...m, value: juneVal.toLocaleString("vi-VN") };
      }
      return m;
    });
  }

  if (range === "may26") {
    return base.map(m => {
      const valNum = parseInt(m.value.replace(/\./g, ""), 10);
      if (!isNaN(valNum) && valNum > 50) {
        const mayVal = Math.round(valNum * 0.88);
        return { ...m, value: mayVal.toLocaleString("vi-VN") };
      }
      return m;
    });
  }

  return base;
}

function mapTimeFilterToRange(filter: string): ChartTimeRange {
  if (filter === "24h" || filter === "24 giờ qua") return "24h";
  if (filter === "7d" || filter === "7 ngày qua") return "7d";
  if (filter === "Tháng 06/2026" || filter === "jun26") return "jun26";
  if (filter === "Tháng 05/2026" || filter === "may26") return "may26";
  return "jul26";
}

function AnalyticsPanel({ tab, search, onSearch, timeFilter, onTimeFilter, page, setPage, pageSize, setPageSize, showNotice }: {
  tab: AnalyticsTab;
  search: string;
  onSearch: (value: string) => void;
  timeFilter: string;
  onTimeFilter: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  showNotice: (message: string) => void;
}) {
  const chartTimeRange = mapTimeFilterToRange(timeFilter);
  const chartData = getChartData(tab, chartTimeRange);
  const metrics = getTabMetrics(tab, chartTimeRange);

  return (
    <section className="panel compact-analytics usage-content">
      <div className={`compact-kpis ${metrics.length === 5 ? "five-columns" : ""}`}>
        {metrics.map(metric => {
          const valStr = `${metric.value}${metric.unit ? " " + metric.unit : ""}`;

          return (
            <div key={metric.label} title={`${metric.label}: ${valStr}`}>
              <div className="kpi-top-row">
                <span>{metric.label}</span>
                {metric.change && <small className={metric.tone}>{metric.change}</small>}
              </div>
              <strong>
                <KpiValue value={metric.value} unit={metric.unit} />
              </strong>
            </div>
          );
        })}
      </div>
      <div className="wide-chart">
        <div className="mini-chart-title">
          <span>{chartData.title}</span>
          <div className="chart-legend-wrap">
            <i className="primary-dot" />{chartData.primaryLabel}
            <i className="secondary-dot" />{chartData.secondaryLabel}
          </div>
        </div>
        <div className="chart">
          <div className="y-axis">
            <span>{chartData.maxY >= 1000 ? `${(chartData.maxY / 1000).toFixed(0)}k` : chartData.maxY}</span>
            <span>{chartData.maxY >= 1000 ? `${((chartData.maxY * 0.6) / 1000).toFixed(0)}k` : Math.round(chartData.maxY * 0.6)}</span>
            <span>{chartData.maxY >= 1000 ? `${((chartData.maxY * 0.3) / 1000).toFixed(0)}k` : Math.round(chartData.maxY * 0.3)}</span>
            <span>0</span>
          </div>
          <div className="bars">
            {chartData.primaryValues.map((val, i) => {
              const secVal = chartData.secondaryValues[i] || 0;
              const pHeight = Math.min(100, Math.max(4, (val / chartData.maxY) * 100));
              const sHeight = Math.min(100, Math.max(2, (secVal / chartData.maxY) * 100));
              const xLabel = chartData.xLabels[i];
              return (
                <div className="bar-slot" key={i}>
                  <span style={{ height: `${pHeight}%` }} />
                  <i style={{ height: `${sHeight}%` }} />
                  <small>{xLabel}</small>
                  <em className="chart-hover-card">
                    <b>{chartTimeRange === "24h" ? `Khung ${xLabel}` : `Ngày ${xLabel}`}</b>
                    <span>{chartData.primaryLabel}: {val.toLocaleString("vi-VN")} {chartData.unit}</span>
                    <span>{chartData.secondaryLabel}: {secVal.toLocaleString("vi-VN")} {chartData.unit}</span>
                  </em>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UsageRecordsTable key={tab} tab={tab} search={search} onSearch={onSearch} timeFilter={timeFilter} onTimeFilter={onTimeFilter} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} showNotice={showNotice} />
    </section>
  );
}
export default function Home() {
  const [teamsState, setTeamsState] = useState<TeamData[]>(teams);
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedApp, setSelectedApp] = useState(teams[0].apps[0]);
  const [membersState, setMembersState] = useState<TeamMember[]>(initialMembers);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Tổng quan");
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("Connection");
  const [search, setSearch] = useState("");
  const [grantFilter, setGrantFilter] = useState("Tất cả Grant");
  const [timeFilter, setTimeFilter] = useState("Tháng 07/2026");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [usageExpanded, setUsageExpanded] = useState(true);
  const [usageView, setUsageView] = useState<AnalyticsTab>("Transaction");
  const [billingExpanded, setBillingExpanded] = useState(true);
  const [billingView, setBillingView] = useState<"current" | "history">("current");
  const [sidebarWidth, setSidebarWidth] = useState(286);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resizingSidebar, setResizingSidebar] = useState(false);

  // Active enabled scopes for the current onboarded app (starts empty by default)
  const [enabledScopes, setEnabledScopes] = useState<AnalyticsTab[]>([]);

  // Log records state for dynamic sandbox testing
  const [logRecordsState, setLogRecordsState] = useState<LogRecord[]>(logRecords);

  function runTestApiCall(scope: AnalyticsTab, params: { bank: string; amount?: string; accountName?: string; note?: string }) {
    const reqId = `req_${scope.slice(0, 3).toUpperCase()}${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    // 1. Add log entry
    const newLog: LogRecord = {
      requestId: reqId,
      method: scope === "Transaction" || scope === "Identity" || scope === "Balance" ? "GET" : "POST",
      endpoint: scopeConfig[scope as Exclude<AnalyticsTab, "Connection">]?.endpoints[0] || `/v2/${scope.toLowerCase()}`,
      scope: scope,
      grantId: "grt_8L2KP91N",
      bank: params.bank || "Techcombank",
      http: "200",
      latency: `${Math.floor(180 + Math.random() * 120)} ms`,
      createdAt: timeStr,
      requestBody: JSON.stringify({ bank: params.bank, amount: params.amount || 100000, accountName: params.accountName, note: params.note }, null, 2),
      responseBody: JSON.stringify({ status: "SUCCESS", requestId: reqId, message: "Sandbox Test Execution Successful", timestamp: new Date().toISOString() }, null, 2)
    };
    setLogRecordsState(prev => [newLog, ...prev]);

    // 2. Add row entry to usageTableData
    if (usageTableData[scope]) {
      const nextStt = (usageTableData[scope].rows.length + 1).toString();
      const amountFormatted = `₫${(parseInt(params.amount || "1500000", 10)).toLocaleString("en-US")}`;
      const bankName = params.bank || "Techcombank";
      const userName = params.accountName || "Nguyễn Minh Anh";
      const noteText = params.note || "Thanh toan don hang #10928";
      const datePart = timeStr.split(" ")[1] || "14/08/2026";
      const random4 = Math.floor(1000 + Math.random() * 9000).toString();

      let newRow: string[] = [];

      switch (scope) {
        case "QRPay":
          // columns: ["STT", "QR ID", "Grant ID", "Reference", "Transaction", "Ngân hàng", "STK", "Tên người nhận", "Số tiền", "Nội dung", "Thông báo", "Thời gian"]
          newRow = [
            nextStt,
            `qr_${reqId.slice(4)}`,
            "grt_8L2KP91N",
            `FT260724${Math.floor(100000 + Math.random() * 900000)}`,
            `BH${Math.floor(10000 + Math.random() * 90000)}`,
            bankName,
            `1903 •••• ${random4}`,
            userName,
            amountFormatted,
            noteText,
            "Delivered",
            timeStr
          ];
          break;

        case "Deeplink":
          // columns: ["STT", "Request ID", "Ngân hàng", "Tên tài khoản", "Số tiền", "Nội dung", "Direct URL", "Status", "Ngày tạo"]
          newRow = [
            nextStt,
            reqId,
            bankName,
            userName,
            amountFormatted,
            noteText,
            `https://dl.bankhub.dev/${bankName.toLowerCase().slice(0, 3)}/pay?id=${reqId}`,
            "Success",
            timeStr
          ];
          break;

        case "Transaction":
          // columns: ["STT", "Request ID", "Grant ID", "Ngân hàng", "Từ ngày", "Đến ngày", "Trạng thái", "Tốc độ", "Thời gian gọi"]
          newRow = [
            nextStt,
            reqId,
            "grt_8L2KP91N",
            bankName,
            "01/08/2026",
            datePart,
            "Success",
            "0.4s",
            timeStr
          ];
          break;

        case "VirtualAccount":
          // columns: ["STT", "VA ID", "Grant ID", "Ngân hàng", "Tên tài khoản", "STK gốc", "Tên VA", "VA", "Trạng thái", "Ngày tạo"]
          newRow = [
            nextStt,
            `va_${reqId.slice(4)}`,
            "grt_8L2KP91N",
            bankName,
            userName,
            `1903 •••• ${random4}`,
            `VA ${userName}`,
            `99021${Math.floor(100000 + Math.random() * 900000)}`,
            "Active",
            timeStr
          ];
          break;

        case "Transfer":
          // columns: ["Transfer ID", "Grant ID", "Ngân hàng nhận", "STK nhận", "Tên người nhận", "Số tiền", "Nội dung", "Trạng thái", "Thời gian"]
          newRow = [
            `trf_${reqId.slice(4)}`,
            "grt_8L2KP91N",
            bankName,
            `0681 •••• ${random4}`,
            userName,
            amountFormatted,
            noteText,
            "Success",
            timeStr
          ];
          break;

        case "Identity":
          // columns: ["Request ID", "Grant ID", "Người dùng", "Ngân hàng", "Thông tin truy vấn", "Kết quả", "Thời gian"]
          newRow = [
            reqId,
            "grt_8L2KP91N",
            userName,
            bankName,
            "Họ tên, CCCD, ngày sinh",
            "Success",
            timeStr
          ];
          break;

        case "Balance":
          // columns: ["Request ID", "Grant ID", "Ngân hàng / Tài khoản", "Số dư khả dụng", "Tiền tệ", "Trạng thái", "Cập nhật"]
          newRow = [
            reqId,
            "grt_8L2KP91N",
            `${bankName} · •• ${random4}`,
            amountFormatted,
            "VND",
            "Success",
            timeStr
          ];
          break;

        case "BalanceHook":
          // columns: ["Event ID", "Webhook Endpoint", "Sự kiện", "Số dư thay đổi", "HTTP Status", "Số lần thử", "Cập nhật cuối"]
          newRow = [
            `evt_${reqId.slice(4)}`,
            "https://api.vendor.vn/cas/webhook",
            "balance.credited",
            `+${amountFormatted}`,
            "200 OK",
            "1/3",
            timeStr
          ];
          break;

        case "eKYC":
          // columns: ["Session ID", "Họ và tên", "Số CCCD", "Độ khớp khuôn mặt", "Liveness Check", "Trạng thái", "Thời gian"]
          newRow = [
            `ekyc_${reqId.slice(4)}`,
            userName,
            `079204••••${random4.slice(0, 2)}`,
            "98.5%",
            "Passed",
            "Verified",
            timeStr
          ];
          break;

        case "Invoice":
          // columns: ["Invoice ID", "Grant ID", "Người mua", "MST", "Giá trị", "Ngày hoá đơn", "Trạng thái", "Cập nhật"]
          newRow = [
            `inv_${reqId.slice(4)}`,
            "grt_8L2KP91N",
            userName,
            `031${Math.floor(10000000 + Math.random() * 90000000)}`,
            amountFormatted,
            datePart,
            "Issued",
            timeStr
          ];
          break;

        default:
          newRow = [nextStt, reqId, "grt_8L2KP91N", bankName, userName, noteText, "Success", timeStr];
      }

      usageTableData[scope].rows = [newRow, ...usageTableData[scope].rows];
    }

    // 3. Increment call count in scopeConfig
    if (scopeConfig[scope as Exclude<AnalyticsTab, "Connection">]) {
      const currentCalls = parseInt(scopeConfig[scope as Exclude<AnalyticsTab, "Connection">].calls.replace(/\./g, ""), 10) || 0;
      scopeConfig[scope as Exclude<AnalyticsTab, "Connection">].calls = (currentCalls + 1).toLocaleString("vi-VN");
    }

    showNotice(`✓ Đã gọi API Sandbox [${scope}] thành công! Dữ liệu đã cập nhật vào Usage & Logs.`);
  }

  const analytics = analyticsData[analyticsTab];
  const filteredRows = useMemo(() => analytics.rows.filter((row) => {
    const text = `${row.grant} ${row.user} ${row.bank} ${row.scopes} ${row.endpoint} ${row.webhook ?? ""}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesGrant = grantFilter === "Tất cả Grant" || row.grant === grantFilter;
    const matchesStatus = statusFilter === "Tất cả trạng thái" || row.status === statusFilter;
    return matchesSearch && matchesGrant && matchesStatus;
  }), [analytics, search, grantFilter, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isDeveloperPage = activeNav === "Keys" || activeNav === "API keys" || activeNav === "RedirectURI/IP" || activeNav === "RedirectURI" || activeNav === "RedirectURL/IP" || activeNav === "API" || activeNav === "Direct URL" || activeNav === "Webhooks";

  function showNotice(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function exportExcel() {
    const headers = analyticsTab === "Connection"
      ? ["Grant ID", "End-user", "Ngân hàng", "Scopes", "Trạng thái", "Cập nhật"]
      : ["Request ID", "Thời gian", "Grant ID", "End-user", "Ngân hàng", "Scope", "Endpoint", "HTTP", "Latency", "Chi phí", ...(analytics.hasWebhook ? ["Webhook"] : [])];
    const rows = filteredRows.map(row => analyticsTab === "Connection"
      ? [row.grant, row.user, row.bank, row.scopes, row.status, row.last]
      : [row.requestId, row.last, row.grant, row.user, row.bank, row.scopes, row.endpoint, row.http, row.latency, row.cost, ...(analytics.hasWebhook ? [row.webhook ?? ""] : [])]);
    const csv = [headers, ...rows].map(columns => columns.map(value => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `cas-${analyticsTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice(`Đã xuất ${filteredRows.length} dòng cho Excel`);
  }

  return (
    <div className={`console-shell ${resizingSidebar ? "resizing-sidebar" : ""}`} style={{ "--sidebar-width": `${sidebarCollapsed ? 64 : sidebarWidth}px` } as CSSProperties}>
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand-row" style={{ display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between", padding: sidebarCollapsed ? "0 8px" : "0 18px" }}>
          {!sidebarCollapsed ? (
            <>
              <a
                className="brand"
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setActiveNav("Tổng quan");
                  setBillingView("current");
                  if (mobileMenu) setMobileMenu(false);
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, textDecoration: "none", cursor: "pointer" }}
                title="Quay về trang Tổng quan"
              >
                <span className="brand-mark"><i /><i /><i /></span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <strong>Cas Console</strong>
                </span>
              </a>
              <button
                className="sidebar-collapse"
                title="Thu gọn menu (Collapse)"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarCollapsed(true);
                  if (mobileMenu) setMobileMenu(false);
                }}
              >
                «
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 2px" }}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setActiveNav("Tổng quan");
                  setBillingView("current");
                  if (mobileMenu) setMobileMenu(false);
                }}
                title="Quay về trang Tổng quan"
                style={{ textDecoration: "none", cursor: "pointer", display: "inline-flex" }}
              >
                <span className="brand-mark" style={{ width: 26, height: 26, padding: 5 }}><i /><i /><i /></span>
              </a>
              <button
                className="sidebar-collapse"
                title="Mở rộng menu (Expand)"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarCollapsed(false);
                }}
                style={{ width: 24, height: 24, margin: 0, fontSize: 14 }}
              >
                »
              </button>
            </div>
          )}
        </div>
        <nav className="sidebar-nav">
          {navGroups.map((group, i) => (
            <div className="nav-group" key={i}>
              {group.label && <p>{group.label}</p>}
              {group.items.map(item => (
                <div className="nav-item-wrap" key={item.label}>
                  <button
                    className={activeNav === item.label ? "active" : ""}
                    title={sidebarCollapsed ? item.label : undefined}
                    onClick={() => {
                      if (sidebarCollapsed) {
                        setActiveNav(item.label);
                        if (item.label === "Usage") setUsageExpanded(true);
                        if (item.label === "Billing") setBillingExpanded(true);
                        return;
                      }
                      if (item.label === "Usage") {
                        if (activeNav === "Usage") setUsageExpanded(!usageExpanded);
                        else { setActiveNav("Usage"); setUsageExpanded(true); }
                      } else if (item.label === "Billing") {
                        if (activeNav === "Billing") setBillingExpanded(!billingExpanded);
                        else { setActiveNav("Billing"); setBillingExpanded(true); setBillingView("current"); }
                      } else {
                        setActiveNav(item.label);
                        setMobileMenu(false);
                      }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.label === "Usage" && <small className={`nav-arrow ${usageExpanded ? "open" : ""}`}>⌄</small>}
                    {item.label === "Billing" && <small className={`nav-arrow ${billingExpanded ? "open" : ""}`}>⌄</small>}
                  </button>
                  {item.label === "Usage" && usageExpanded && !sidebarCollapsed && (
                    <div className="usage-subnav">
                      {visibleUsageTabs.map(tab => (
                        <button
                          className={activeNav === "Usage" && usageView === tab ? "active" : ""}
                          key={tab}
                          onClick={() => {
                            setActiveNav("Usage");
                            setUsageView(tab);
                            setAnalyticsTab(tab);
                            setSearch("");
                            setGrantFilter("Tất cả Grant");
                            setStatusFilter("Tất cả trạng thái");
                            setPage(1);
                            setMobileMenu(false);
                          }}
                        >
                          {usageTabLabel(tab)}
                        </button>
                      ))}
                    </div>
                  )}
                  {item.label === "Billing" && billingExpanded && !sidebarCollapsed && (
                    <div className="usage-subnav">
                      <button className={activeNav === "Billing" && billingView === "current" ? "active" : ""} onClick={() => { setActiveNav("Billing"); setBillingView("current"); setMobileMenu(false); }}>
                        Hóa đơn hiện tại
                      </button>
                      <button className={activeNav === "Billing" && billingView === "history" ? "active" : ""} onClick={() => { setActiveNav("Billing"); setBillingView("history"); setMobileMenu(false); }}>
                        Lịch sử thanh toán
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="nav-group utility-nav">
            <button title={sidebarCollapsed ? "Tài liệu" : undefined} onClick={() => { showNotice("Đã mở tài liệu Cas"); setMobileMenu(false); }}>
              <span className="nav-icon">▤</span><span className="nav-label">Tài liệu</span>
            </button>
            <button title={sidebarCollapsed ? "Hỗ trợ" : undefined} onClick={() => { showNotice("Đã mở trung tâm hỗ trợ"); setMobileMenu(false); }}>
              <span className="nav-icon">◉</span><span className="nav-label">Hỗ trợ</span>
            </button>
          </div>
        </nav>
        {!sidebarCollapsed && (
          <div
            className="sidebar-resizer"
            role="separator"
            aria-label="Thay đổi chiều rộng menu"
            aria-orientation="vertical"
            onPointerDown={e => { setResizingSidebar(true); e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={e => { if (resizingSidebar) setSidebarWidth(Math.min(390, Math.max(220, e.clientX))); }}
            onPointerUp={e => { setResizingSidebar(false); e.currentTarget.releasePointerCapture(e.pointerId); }}
            onPointerCancel={() => setResizingSidebar(false)}
          />
        )}
      </aside>

      <div className="workspace" onClick={() => { if (appMenuOpen) setAppMenuOpen(false); if (teamMenuOpen) setTeamMenuOpen(false); if (userMenuOpen) setUserMenuOpen(false); }}>
        <header className="topbar">
          <button className="mobile-trigger" onClick={() => setMobileMenu(true)}>☰</button>
          <div className="crumbs">
            <span>{selectedApp.name}</span>
            <b>/</b>
            <strong>{activeNav}</strong>
            {activeNav === "Usage" && <><b>/</b><strong>{usageView === "Connection" ? "Grant" : usageView === "VirtualAccount" ? "Virtual Account" : usageView === "BalanceHook" ? "Balance Hook" : usageView}</strong></>}
            {activeNav === "Billing" && <><b>/</b><strong>{billingView === "current" ? "Hóa đơn hiện tại" : "Lịch sử thanh toán"}</strong></>}
          </div>
          <div className="top-actions">
            {/* Team Selector Dropdown */}
            <div className="team-selector-wrap" style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  height: "32px",
                  padding: "0 10px",
                  background: "white",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  boxSizing: "border-box",
                }}
                onClick={() => { setTeamMenuOpen(!teamMenuOpen); setAppMenuOpen(false); setUserMenuOpen(false); }}
              >
                <span style={{ color: "var(--muted)", fontSize: "11px", fontWeight: 500 }}>Team:</span>
                <strong>{selectedTeam.name}</strong>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>⌄</span>
              </button>
              {teamMenuOpen && (
                <div className="app-menu" style={{ top: "calc(100% + 4px)", right: 0, left: "auto", width: 230, zIndex: 20, borderRadius: 8 }}>
                  <div className="app-menu-heading">
                    <span>Teams của bạn</span>
                    <button onClick={() => { setActiveNav("Tạo một team mới"); setTeamMenuOpen(false); }}>Tạo Team</button>
                  </div>
                  {teamsState.map(team => (
                    <button
                      className={team.id === selectedTeam.id ? "selected" : ""}
                      key={team.id}
                      onClick={() => {
                        setSelectedTeam(team);
                        setSelectedApp(team.apps[0]);
                        setTeamMenuOpen(false);
                      }}
                    >
                      <span className="app-avatar" style={{ background: "#4a5568" }}>{team.short}</span>
                      <span>
                        <strong>{team.name}</strong>
                        <small>Vai trò: {team.role}</small>
                      </span>
                      {team.id === selectedTeam.id && <b>✓</b>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* App Selector Dropdown */}
            <div className="app-selector-wrap" style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  height: "32px",
                  padding: "0 10px",
                  background: "white",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  boxSizing: "border-box",
                }}
                onClick={() => { setAppMenuOpen(!appMenuOpen); setTeamMenuOpen(false); setUserMenuOpen(false); }}
              >
                <span style={{ color: "var(--muted)", fontSize: "11px", fontWeight: 500 }}>App:</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: selectedApp.color }} />
                <strong>{selectedApp.name}</strong>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>⌄</span>
              </button>
              {appMenuOpen && (
                <div className="app-menu" style={{ top: "calc(100% + 4px)", right: 0, left: "auto", width: 250, zIndex: 20, borderRadius: 8 }}>
                  <div className="app-menu-heading">
                    <span>Apps của {selectedTeam.name}</span>
                    <button onClick={() => { setActiveNav("Tạo ứng dụng mới"); setAppMenuOpen(false); }}>Tạo App</button>
                  </div>
                  {selectedTeam.apps.map(app => (
                    <button
                      className={app.id === selectedApp.id ? "selected" : ""}
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setAppMenuOpen(false);
                      }}
                    >
                      <span className="app-avatar" style={{ background: app.color }}>{app.short}</span>
                      <span>
                        <strong>{app.name}</strong>
                        <small>{app.environment} · {app.id}</small>
                      </span>
                      {app.id === selectedApp.id && <b>✓</b>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile (Email Only) */}
            <div className="user-avatar-wrap" onClick={e => e.stopPropagation()}>
              <button
                className="user-profile-btn"
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  height: "32px",
                  padding: "0 10px",
                  background: "white",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxSizing: "border-box",
                }}
                onClick={() => { setUserMenuOpen(!userMenuOpen); setAppMenuOpen(false); setTeamMenuOpen(false); }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--ink)" }}>minh.nguyen@vietfin.vn</span>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>⌄</span>
              </button>
              {userMenuOpen && (
                <div className="user-menu-popover" style={{ top: "calc(100% + 4px)", right: 0, borderRadius: 8, width: 220 }}>
                  <div className="user-menu-header">
                    <div>
                      <strong>Minh Nguyễn</strong>
                      <small>minh.nguyen@vietfin.vn</small>
                      <span className="badge">Super Admin</span>
                    </div>
                  </div>
                  <button onClick={() => { setActiveNav("Thiết lập Team"); setUserMenuOpen(false); }}>🏢 Thiết lập Team</button>
                  <button onClick={() => { setActiveNav("Tạo một team mới"); setUserMenuOpen(false); }}>➕ Tạo một team mới</button>
                  <button onClick={() => { setActiveNav("Tạo ứng dụng mới"); setUserMenuOpen(false); }}>🚀 Tạo ứng dụng mới</button>
                  <div style={{ borderTop: "1px solid var(--line)", margin: "4px 0" }} />
                  <button onClick={() => { showNotice("Đã mở trang Hồ sơ cá nhân"); setUserMenuOpen(false); }}>👤 Hồ sơ cá nhân</button>
                  <button style={{ color: "var(--red)" }} onClick={() => { showNotice("Mô phỏng đăng xuất thành công"); setUserMenuOpen(false); }}>🚪 Đăng xuất</button>
                </div>
              )}
            </div>

            {/* Language Switch (Only Vietnam and English flags, no dropdown icon) */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "6px",
                height: "32px",
                padding: "0 3px",
                gap: "2px",
                boxSizing: "border-box",
              }}
            >
              <button
                style={{
                  border: "none",
                  background: currentLang.code === "VI" ? "rgba(92, 76, 225, 0.12)" : "transparent",
                  borderRadius: "4px",
                  height: "24px",
                  padding: "0 5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  opacity: currentLang.code === "VI" ? 1 : 0.4,
                  transition: "all 0.15s",
                }}
                title="Tiếng Việt"
                onClick={() => {
                  const viLang = languages.find(l => l.code === "VI") || languages[0];
                  setCurrentLang(viLang);
                  showNotice("Đã chuyển ngôn ngữ sang Tiếng Việt");
                }}
              >
                🇻🇳
              </button>
              <button
                style={{
                  border: "none",
                  background: currentLang.code === "EN" ? "rgba(92, 76, 225, 0.12)" : "transparent",
                  borderRadius: "4px",
                  height: "24px",
                  padding: "0 5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  opacity: currentLang.code === "EN" ? 1 : 0.4,
                  transition: "all 0.15s",
                }}
                title="English"
                onClick={() => {
                  const enLang = languages.find(l => l.code === "EN") || languages[1];
                  setCurrentLang(enLang);
                  showNotice("Switched language to English");
                }}
              >
                🇺🇸
              </button>
            </div>
          </div>
        </header>
        <main className="main compact-main">
          {notice && <div className="toast"><span>✓</span>{notice}</div>}

          {activeNav === "Grants" || activeNav === "Connections" ? (
            <AnalyticsPanel tab="Connection" search={search} onSearch={setSearch} timeFilter={timeFilter} onTimeFilter={setTimeFilter} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} showNotice={showNotice} />
          ) : activeNav === "Usage" ? (
            <AnalyticsPanel tab={analyticsTab} search={search} onSearch={setSearch} timeFilter={timeFilter} onTimeFilter={setTimeFilter} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} showNotice={showNotice} />
          ) : activeNav === "Billing" ? (
            <UsageTotal
              billingView={billingView}
              onNavigateHistory={() => { setBillingView("history"); setBillingExpanded(true); }}
              onNavigateCurrent={() => { setBillingView("current"); setBillingExpanded(true); }}
              onSelectTab={tab => { if (tab === "Connection") { setActiveNav("Grants"); setAnalyticsTab("Connection"); } else { setActiveNav("Usage"); setUsageExpanded(true); setUsageView(tab); setAnalyticsTab(tab); } setPage(1); }}
              showNotice={showNotice}
            />
          ) : activeNav === "Tổng quan" ? (
            <IntroOverviewScreen onNavigate={setActiveNav} showNotice={showNotice} />
          ) : activeNav === "Thiết lập Team" || activeNav === "Team của tôi" ? (
            <TeamSettingsScreen
              teams={teamsState}
              setTeams={setTeamsState}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              selectedApp={selectedApp}
              setSelectedApp={setSelectedApp}
              members={membersState}
              setMembers={setMembersState}
              onNavigate={setActiveNav}
              showNotice={showNotice}
            />
          ) : activeNav === "Mời thành viên mới" || activeNav === "Thêm thành viên" ? (
            <InviteMemberScreen
              selectedTeam={selectedTeam}
              onInviteMember={(newMember) => {
                setMembersState(prev => [...prev, newMember]);
                setActiveNav("Thiết lập Team");
                showNotice(`✓ Đã gửi lời mời tham gia team tới ${newMember.email}`);
              }}
              onCancel={() => setActiveNav("Thiết lập Team")}
              showNotice={showNotice}
            />
          ) : activeNav === "Tạo một team mới" ? (
            <CreateTeamScreen
              onCreateTeam={(name) => {
                const newId = `team_${Date.now()}`;
                const newTeam: TeamData = {
                  id: newId,
                  name: name,
                  short: name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "T1",
                  role: "Owner",
                  apps: [
                    {
                      id: `app_${Math.random().toString(36).substring(2, 9)}`,
                      name: `${name} App`,
                      short: name.substring(0, 2).toUpperCase() || "AP",
                      color: "#4f46e5",
                      environment: "Production",
                    }
                  ]
                };
                setTeamsState(prev => [...prev, newTeam]);
                setSelectedTeam(newTeam);
                setSelectedApp(newTeam.apps[0]);
                setActiveNav("Thiết lập Team");
                showNotice(`✓ Đã tạo team "${name}" thành công!`);
              }}
              onCancel={() => setActiveNav("Thiết lập Team")}
              showNotice={showNotice}
            />
          ) : activeNav === "Tạo ứng dụng mới" ? (
            <CreateAppScreen
              currentTeam={selectedTeam}
              onCreateApp={(appInfo) => {
                const newApp: AppData = {
                  id: `app_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  name: appInfo.name,
                  short: appInfo.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "AP",
                  color: "#6956d9",
                  environment: "Production",
                };
                setTeamsState(prev => prev.map(t => {
                  if (t.id === selectedTeam.id) {
                    return { ...t, apps: [...t.apps, newApp] };
                  }
                  return t;
                }));
                setSelectedApp(newApp);
                setActiveNav("Keys");
                showNotice(`✓ Đã tạo ứng dụng "${appInfo.name}" thành công!`);
              }}
              onCancel={() => setActiveNav("Thiết lập Team")}
              showNotice={showNotice}
            />
          ) : activeNav === "Cài đặt App" ? (
            <AppSettingsScreen selectedApp={selectedApp} setSelectedApp={setSelectedApp} showNotice={showNotice} />
          ) : activeNav === "Grant debugger" ? (
            <GrantDebuggerScreen showNotice={showNotice} />
          ) : activeNav === "Keys" || activeNav === "API keys" ? (
            <ApiKeysScreen showNotice={showNotice} />
          ) : activeNav === "RedirectURI/IP" || activeNav === "RedirectURI" || activeNav === "RedirectURL/IP" || activeNav === "API" || activeNav === "Direct URL" ? (
            <ApiSettingsScreen showNotice={showNotice} />
          ) : activeNav === "Webhooks" ? (
            <WebhooksScreen showNotice={showNotice} />
          ) : activeNav === "Logs" ? (
            <LogsScreen logRecordsData={logRecordsState} showNotice={showNotice} />
          ) : (
            <DataScreen data={screenData[activeNav]} showNotice={showNotice} />
          )}
        </main>
      </div>
      {mobileMenu && <button className="backdrop" onClick={() => setMobileMenu(false)} />}

      {/* Quick Search / Command Palette Modal */}
      {searchModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setSearchModalOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-modal-input-row">
              <span>⌕</span>
              <input
                type="text"
                autoFocus
                placeholder="Tìm kiếm nhanh danh mục, tính năng, hoặc trợ giúp..."
                value={searchModalQuery}
                onChange={e => setSearchModalQuery(e.target.value)}
              />
              <button style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--muted)" }} onClick={() => setSearchModalOpen(false)}>Esc</button>
            </div>
            <div className="search-modal-results">
              {[
                { title: "Tổng quan", desc: "Trang chủ & Thống kê tổng hợp", nav: "Tổng quan" },
                { title: "Giao dịch (Usage)", desc: "Nhật ký gọi API & Thống kê sản lượng", nav: "Usage" },
                { title: "Billing & Hoá đơn", desc: "Quản lý chi phí, thanh toán & e-Invoice VAT", nav: "Billing" },
                { title: "Grants & Kết nối", desc: "Quản lý danh sách kết nối ngân hàng", nav: "Grants" },
                { title: "API Keys", desc: "Quản lý Secret Keys & Client Credentials", nav: "API keys" },
                { title: "Webhooks", desc: "Cấu hình Webhook & retry log", nav: "Webhooks" },
                { title: "Logs hệ thống", desc: "Xem chi tiết Request/Response payload", nav: "Logs" },
                { title: "Checklist Golive", desc: "Production checklist & Nộp hồ sơ duyệt Golive", nav: "Checklist Golive" },
              ]
                .filter(item => item.title.toLowerCase().includes(searchModalQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchModalQuery.toLowerCase()))
                .map(item => (
                  <button
                    key={item.title}
                    className="search-modal-item"
                    onClick={() => {
                      setActiveNav(item.nav);
                      setSearchModalOpen(false);
                    }}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.desc}</small>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--purple)", fontWeight: 600 }}>Di chuyển</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageTotal({
  onSelectTab,
  showNotice,
  billingView = "current",
  onNavigateHistory,
  onNavigateCurrent,
}: {
  onSelectTab?: (tab: AnalyticsTab) => void;
  showNotice: (message: string) => void;
  billingView?: "current" | "history";
  onNavigateHistory?: () => void;
  onNavigateCurrent?: () => void;
}) {
  const [paymentState, setPaymentState] = useState<"unpaid" | "scanning" | "paid">("unpaid");
  const [wantEinvoice, setWantEinvoice] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const historyCycles = [
    {
      cycle: "Tháng 06/2026",
      period: "01/06/2026 – 30/06/2026",
      invoiceCode: "CAS-2026-06-001",
      total: "₫252,797,600",
      subtotal: "₫229,816,000",
      vat: "₫22,981,600",
      status: "Đã thanh toán",
      date: "02/07/2026",
      time: "10:24",
      invoice: true,
      items: [
        { name: "Transaction scope", quantity: "58", unit: "lần", price: "100.000đ", cost: "₫5.800.000" },
        { name: "Transaction Request", quantity: "398.200", unit: "lần", price: "30đ", cost: "₫11.946.000" },
        { name: "QR Pay Transaction", quantity: "124.500", unit: "lần", price: "50đ + 0.3%", cost: "₫13.450.000" },
        { name: "Virtual Account Active", quantity: "1.420", unit: "tài khoản", price: "1.000đ", cost: "₫1.420.000" },
        { name: "Transfer Transaction", quantity: "98.600", unit: "lần", price: "2.000đ", cost: "₫197.200.000" },
      ]
    },
    {
      cycle: "Tháng 05/2026",
      period: "01/05/2026 – 31/05/2026",
      invoiceCode: "CAS-2026-05-001",
      total: "₫233,521,200",
      subtotal: "₫212,292,000",
      vat: "₫21,229,200",
      status: "Đã thanh toán",
      date: "04/06/2026",
      time: "15:40",
      invoice: true,
      items: [
        { name: "Transaction scope", quantity: "52", unit: "lần", price: "100.000đ", cost: "₫5.200.000" },
        { name: "Transaction Request", quantity: "362.400", unit: "lần", price: "30đ", cost: "₫10.872.000" },
        { name: "QR Pay Transaction", quantity: "115.800", unit: "lần", price: "50đ + 0.3%", cost: "₫12.510.000" },
        { name: "Virtual Account Active", quantity: "1.310", unit: "tài khoản", price: "1.000đ", cost: "₫1.310.000" },
        { name: "Transfer Transaction", quantity: "91.200", unit: "lần", price: "2.000đ", cost: "₫182.400.000" },
      ]
    },
    {
      cycle: "Tháng 04/2026",
      period: "01/04/2026 – 30/04/2026",
      invoiceCode: "CAS-2026-04-001",
      total: "₫215,358,000",
      subtotal: "₫195,780,000",
      vat: "₫19,578,000",
      status: "Đã thanh toán",
      date: "05/05/2026",
      time: "09:15",
      invoice: false,
      items: [
        { name: "Transaction scope", quantity: "48", unit: "lần", price: "100.000đ", cost: "₫4.800.000" },
        { name: "Transaction Request", quantity: "324.000", unit: "lần", price: "30đ", cost: "₫9.720.000" },
        { name: "QR Pay Transaction", quantity: "102.300", unit: "lần", price: "50đ + 0.3%", cost: "₫11.080.000" },
        { name: "Virtual Account Active", quantity: "1.180", unit: "tài khoản", price: "1.000đ", cost: "₫1.180.000" },
        { name: "Transfer Transaction", quantity: "84.500", unit: "lần", price: "2.000đ", cost: "₫169.000.000" },
      ]
    },
    {
      cycle: "Tháng 03/2026",
      period: "01/03/2026 – 31/03/2026",
      invoiceCode: "CAS-2026-03-001",
      total: "₫198,632,500",
      subtotal: "₫180,575,000",
      vat: "₫18,057,500",
      status: "Đã thanh toán",
      date: "02/04/2026",
      time: "14:20",
      invoice: true,
      items: [
        { name: "Transaction scope", quantity: "42", unit: "lần", price: "100.000đ", cost: "₫4.200.000" },
        { name: "Transaction Request", quantity: "291.500", unit: "lần", price: "30đ", cost: "₫8.745.000" },
        { name: "QR Pay Transaction", quantity: "94.200", unit: "lần", price: "50đ + 0.3%", cost: "₫10.180.000" },
        { name: "Virtual Account Active", quantity: "1.050", unit: "tài khoản", price: "1.000đ", cost: "₫1.050.000" },
        { name: "Transfer Transaction", quantity: "78.200", unit: "lần", price: "2.000đ", cost: "₫156.400.000" },
      ]
    },
  ];

  const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<typeof historyCycles[0] | null>(null);

  const [einvoiceCompany, setEinvoiceCompany] = useState("Công ty CP VietFin Digital");
  const [einvoiceTaxId, setEinvoiceTaxId] = useState("0317849201");
  const [einvoiceEmail, setEinvoiceEmail] = useState("ketoan@vietfin.vn");
  const [einvoiceAddress, setEinvoiceAddress] = useState("Tầng 12, Tòa nhà VietFin, 180 Nguyễn Thị Minh Khai, Q.3, TP.HCM");
  const [einvoiceNote, setEinvoiceNote] = useState("Xuất HĐĐT kỳ 07/2026 cho HĐ CAS-2026-07");

  const billingItems = [
    { tab: "Transaction" as const, name: "Transaction scope", quantity: "62", unit: "lần", price: "100.000đ", cost: "₫6.200.000" },
    { tab: "Transaction" as const, name: "Transaction Request", quantity: "426.800", unit: "lần", price: "30đ", cost: "₫12.804.000" },
    { tab: "QRPay" as const, name: "QR Pay Transaction", quantity: "132.400", unit: "lần", price: "50đ + 0.3%", cost: "₫14.280.000" },
    { tab: "VirtualAccount" as const, name: "Virtual Account Active", quantity: "1.520", unit: "tài khoản", price: "1.000đ", cost: "₫1.520.000" },
    { tab: "Transfer" as const, name: "Transfer Transaction", quantity: "107.800", unit: "lần", price: "2.000đ", cost: "₫215.600.000" },
  ];

  if (billingView === "history") {
    if (!selectedHistoryCycle) {
      return (
        <div style={{ maxWidth: 1080, padding: "8px 0 40px" }}>
          <section style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>Lịch sử thanh toán</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Chọn một kỳ thanh toán bên dưới để xem bảng kê chi tiết dịch vụ và tải hóa đơn.
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "#64748b", fontSize: 12 }}>KỲ THANH TOÁN</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "#64748b", fontSize: 12 }}>TỔNG TIỀN</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "#64748b", fontSize: 12 }}>TRẠNG THÁI</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "#64748b", fontSize: 12 }}>HÓA ĐƠN VAT</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "#64748b", fontSize: 12, textAlign: "right" }}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {historyCycles.map(cycle => (
                    <tr
                      key={cycle.cycle}
                      style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                      onClick={() => setSelectedHistoryCycle(cycle)}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <strong style={{ color: "#0f172a", display: "block" }}>{cycle.cycle}</strong>
                        <span style={{ fontSize: 12, color: "#64748b" }}>Mã HD: {cycle.invoiceCode}</span>
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: "#0f172a" }}>{cycle.total}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 12 }}>
                          ● {cycle.status}
                        </span>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>vào {cycle.date}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {cycle.invoice ? (
                          <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 13 }}>✓ Đã xuất HĐĐT</span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>Không yêu cầu</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedHistoryCycle(cycle);
                          }}
                          style={{
                            background: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            padding: "6px 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                            cursor: "pointer",
                          }}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    // Detail view using the exact same screen layout as the main billing page
    return (
      <div className="usage-total" style={{ padding: "8px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "20px", alignItems: "start", width: "100%" }}>
          {/* Left Panel: Invoice Breakdown Table */}
          <div className="panel" style={{ padding: "28px 32px", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            {/* Heading */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-color)" }}>App VietFin Digital</h2>
                <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                  Kỳ sử dụng: <strong style={{ color: "var(--text-color)" }}>{selectedHistoryCycle.cycle}</strong> ({selectedHistoryCycle.period})
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", color: "var(--muted)" }}>Mã hóa đơn: <strong style={{ color: "var(--text-color)" }}>{selectedHistoryCycle.invoiceCode}</strong></div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="billing-breakdown">
              <thead>
                <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "left" }}>Tên dịch vụ</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Số lượng</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Đơn vị tính</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Đơn giá</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedHistoryCycle.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 14px", textAlign: "left" }}>
                      <strong style={{ color: "var(--text-color)" }}>{item.name}</strong>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>{item.quantity}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)" }}>{item.unit}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)" }}>{item.price}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}><strong>{item.cost}</strong></td>
                  </tr>
                ))}

                {/* Totals inside table */}
                <tr style={{ borderTop: "2px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
                  <td colSpan={3} style={{ padding: "12px 14px" }}></td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)", fontWeight: 500, fontSize: "14px" }}>Tạm tính:</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: "15px" }}>{selectedHistoryCycle.subtotal}</td>
                </tr>
                <tr style={{ background: "rgba(0,0,0,0.01)" }}>
                  <td colSpan={3} style={{ padding: "12px 14px" }}></td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)", fontWeight: 500, fontSize: "14px" }}>Thuế VAT (10%):</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: "15px" }}>{selectedHistoryCycle.vat}</td>
                </tr>
                <tr style={{ background: "rgba(0,0,0,0.03)", borderTop: "1px solid var(--border-color)" }}>
                  <td colSpan={3} style={{ padding: "12px 14px" }}></td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: "15px" }}>Tổng cộng:</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--purple)", fontSize: "18px" }}>{selectedHistoryCycle.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Sticky Summary Card */}
          <div className="panel invoice-summary" style={{ padding: "20px", background: "white", borderRadius: "10px", border: "1px solid var(--border-color)", boxShadow: "0 1px 6px rgba(0,0,0,0.02)", position: "sticky", top: "16px" }}>
            <div className="invoice-status-line" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span className="invoice-label" style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>KỲ THANH TOÁN</span>
              <span className="invoice-payment-status paid" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                <i style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
                Đã thanh toán
              </span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 2px", color: "#0f172a" }}>{selectedHistoryCycle.cycle}</h3>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>Thanh toán lúc {selectedHistoryCycle.time} ngày {selectedHistoryCycle.date}</div>

            <dl style={{ margin: "0 0 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)", fontSize: "13.5px" }}>
                <dt style={{ color: "var(--muted)" }}>Tạm tính</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{selectedHistoryCycle.subtotal}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)", fontSize: "13.5px" }}>
                <dt style={{ color: "var(--muted)" }}>Thuế VAT (10%)</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{selectedHistoryCycle.vat}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 0", fontSize: "14px" }}>
                <dt style={{ fontWeight: 700, color: "#0f172a" }}>Tổng thanh toán</dt>
                <dd style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--purple)" }}>{selectedHistoryCycle.total}</dd>
              </div>
            </dl>

            {/* VAT Toggle Checkbox */}
            <div style={{ background: "var(--bg-card)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 500, margin: 0, fontSize: "13px" }}>
                <input type="checkbox" checked={selectedHistoryCycle.invoice} readOnly style={{ width: "14px", height: "14px" }} />
                <span>Xuất hóa đơn VAT điện tử (e-Invoice)</span>
              </label>
              {selectedHistoryCycle.invoice && (
                <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <div style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "210px" }}>
                    <strong>{einvoiceCompany}</strong>
                  </div>
                  <button type="button" style={{ border: "none", background: "none", color: "var(--purple)", cursor: "pointer", fontSize: "12px", fontWeight: 600, padding: 0 }} onClick={() => setShowInvoiceModal(true)}>
                    Sửa ✎
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="primary-button" onClick={() => showNotice(selectedHistoryCycle.invoice ? `Đã tải hoá đơn điện tử VAT kỳ ${selectedHistoryCycle.cycle}` : "Đã tải chứng từ thanh toán")} style={{ width: "100%", height: "36px", padding: 0, fontSize: "13.5px" }}>
                {selectedHistoryCycle.invoice ? "Tải hóa đơn VAT (.pdf)" : "Tải chứng từ thanh toán"}
              </button>
              <button className="invoice-secondary" onClick={() => setSelectedHistoryCycle(null)} style={{ width: "100%", height: "36px", cursor: "pointer", fontSize: "13px", margin: 0 }}>
                Quay lại danh sách lịch sử
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="usage-total" style={{ padding: "8px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "20px", alignItems: "start", width: "100%" }}>
        {/* Left Panel: Invoice Breakdown Table */}
        <div className="panel" style={{ padding: "28px 32px", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          {/* Heading */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-color)" }}>App VietFin Digital</h2>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                Kỳ sử dụng: <strong style={{ color: "var(--text-color)" }}>Tháng 07/2026</strong> (01/07/2026 – 31/07/2026)
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", color: "var(--muted)" }}>Mã hóa đơn: <strong style={{ color: "var(--text-color)" }}>CAS-2026-07-001</strong></div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="billing-breakdown">
            <thead>
              <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "left" }}>Tên dịch vụ</th>
                <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Số lượng</th>
                <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Đơn vị tính</th>
                <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Đơn giá</th>
                <th style={{ padding: "12px 14px", fontWeight: 600, fontSize: "13px", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {billingItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "12px 14px", textAlign: "left" }}>
                    <strong style={{ color: "var(--text-color)" }}>{item.name}</strong>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)" }}>{item.unit}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)" }}>{item.price}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}><strong>{item.cost}</strong></td>
                </tr>
              ))}

              {/* Totals inside table */}
              <tr style={{ borderTop: "2px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
                <td colSpan={3} style={{ padding: "12px 14px" }}></td>
                <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)", fontWeight: 500, fontSize: "14px" }}>Tạm tính:</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: "15px" }}>₫250,404,000</td>
              </tr>
              <tr style={{ background: "rgba(0,0,0,0.01)" }}>
                <td colSpan={3} style={{ padding: "12px 14px" }}></td>
                <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)", fontWeight: 500, fontSize: "14px" }}>Thuế VAT (10%):</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: "15px" }}>₫25,040,400</td>
              </tr>
              <tr style={{ background: "rgba(0,0,0,0.03)", borderTop: "1px solid var(--border-color)" }}>
                <td colSpan={3} style={{ padding: "12px 14px" }}></td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: "15px" }}>Tổng cộng:</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--purple)", fontSize: "18px" }}>₫275,444,400</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Sticky Summary Card */}
        <div className="panel invoice-summary" style={{ padding: "20px", background: "white", borderRadius: "10px", border: "1px solid var(--border-color)", boxShadow: "0 1px 6px rgba(0,0,0,0.02)", position: "sticky", top: "16px" }}>
          <div className="invoice-status-line" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span className="invoice-label" style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>KỲ THANH TOÁN</span>
            <span className={`invoice-payment-status ${paymentState}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: paymentState === "paid" ? "#10b981" : "#d97706", background: paymentState === "paid" ? "rgba(16,185,129,0.1)" : "rgba(217,119,6,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
              <i style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
              {paymentState === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 12px", color: "#0f172a" }}>Tháng 07/2026</h3>

          <dl style={{ margin: "0 0 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)", fontSize: "13.5px" }}>
              <dt style={{ color: "var(--muted)" }}>Tạm tính</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>₫250,404,000</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)", fontSize: "13.5px" }}>
              <dt style={{ color: "var(--muted)" }}>Thuế VAT (10%)</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>₫25,040,400</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 0", fontSize: "14px" }}>
              <dt style={{ fontWeight: 700, color: "#0f172a" }}>Tổng thanh toán</dt>
              <dd style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--purple)" }}>₫275,444,400</dd>
            </div>
          </dl>

          {/* VAT Toggle Checkbox */}
          <div style={{ background: "var(--bg-card)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 500, margin: 0, fontSize: "13px" }}>
              <input type="checkbox" checked={wantEinvoice} onChange={e => {
                const checked = e.target.checked;
                setWantEinvoice(checked);
                if (checked) setShowInvoiceModal(true);
              }} style={{ width: "14px", height: "14px" }} />
              <span>Xuất hóa đơn VAT điện tử (e-Invoice)</span>
            </label>
            {wantEinvoice && (
              <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                <div style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "210px" }}>
                  <strong>{einvoiceCompany}</strong>
                </div>
                <button type="button" style={{ border: "none", background: "none", color: "var(--purple)", cursor: "pointer", fontSize: "12px", fontWeight: 600, padding: 0 }} onClick={() => setShowInvoiceModal(true)}>
                  Sửa ✎
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {paymentState === "paid" ? (
              <button className="primary-button" onClick={() => showNotice(wantEinvoice ? `Đã tải hoá đơn điện tử gửi tới ${einvoiceEmail}` : "Đã tải chứng từ thanh toán")} style={{ width: "100%", height: "36px", padding: 0, fontSize: "13.5px" }}>
                {wantEinvoice ? "Tải hóa đơn VAT (.pdf)" : "Tải chứng từ thanh toán"}
              </button>
            ) : (
              <button className="primary-button payment-button" onClick={() => setPaymentState("scanning")} style={{ width: "100%", height: "38px", padding: 0, background: "var(--purple)", fontWeight: 600, fontSize: "14px" }}>
                Thanh toán
              </button>
            )}
            <button className="invoice-secondary" onClick={() => onNavigateHistory?.()} style={{ width: "100%", height: "36px", cursor: "pointer", fontSize: "13px", margin: 0 }}>
              Xem lịch sử thanh toán
            </button>
          </div>
        </div>
      </div>
      {paymentState === "scanning" && <div className="payment-screen" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <div className="payment-modal">
          <div className="payment-heading"><div><span>THANH TOÁN HOÁ ĐƠN</span><h2 id="payment-title">Quét mã QR để thanh toán</h2></div><button aria-label="Đóng" onClick={() => setPaymentState("unpaid")}>×</button></div>
          <div className="payment-content">
            <div className="payment-qr"><div className="qr-noise"><i /><i /><i /></div><small>VIETQR</small></div>
            <div className="payment-info">
              <span>SỐ TIỀN THANH TOÁN</span><strong>₫380,835,400</strong>
              <dl><div><dt>Ngân hàng</dt><dd>MB Bank</dd></div><div><dt>Người nhận</dt><dd>CAS VIETNAM JSC</dd></div><div><dt>Nội dung</dt><dd>CAS APP8F2 JUL2026</dd></div><div><dt>Hết hạn</dt><dd>14:59</dd></div></dl>
              {wantEinvoice && <div className="payment-einvoice-strip">
                <div>
                  <span>📝 HÓA ĐƠN ĐIỆN TỬ:</span>
                  <strong>{einvoiceCompany}</strong> (MST: {einvoiceTaxId}) · <em>{einvoiceEmail}</em>
                </div>
                <button type="button" onClick={() => setShowInvoiceModal(true)}>Sửa</button>
              </div>}
              <p style={{ marginTop: "12px" }}>Mở ứng dụng ngân hàng, quét mã và giữ nguyên nội dung chuyển khoản.</p>
              <button className="primary-button" onClick={() => { setPaymentState("paid"); showNotice(wantEinvoice ? `Thanh toán thành công! Hóa đơn đã gửi tới ${einvoiceEmail}` : "Thanh toán thành công!"); }}>Mô phỏng thanh toán thành công</button>
              <button onClick={() => setPaymentState("unpaid")}>Huỷ thanh toán</button>
            </div>
          </div>
        </div>
      </div>}

      {showInvoiceModal && <div className="payment-screen" role="dialog" aria-modal="true" aria-labelledby="invoice-modal-title">
        <div className="invoice-modal-dialog">
          <div className="payment-heading">
            <div><span>THÔNG TIN THUẾ & HÓA ĐƠN</span><h2 id="invoice-modal-title">Cấu hình hóa đơn điện tử VAT</h2></div>
            <button aria-label="Đóng" onClick={() => setShowInvoiceModal(false)}>×</button>
          </div>
          <div className="invoice-modal-body">
            <div className="einvoice-field">
              <label>Tên đơn vị mua hàng / Công ty <b className="req">*</b></label>
              <input type="text" value={einvoiceCompany} onChange={e => setEinvoiceCompany(e.target.value)} placeholder="VD: Công ty CP VietFin Digital" />
            </div>
            <div className="einvoice-field-row">
              <div className="einvoice-field">
                <label>Mã số thuế (MST) <b className="req">*</b></label>
                <input type="text" value={einvoiceTaxId} onChange={e => setEinvoiceTaxId(e.target.value)} placeholder="VD: 0317849201" />
              </div>
              <div className="einvoice-field">
                <label>Email nhận HĐĐT <b className="req">*</b></label>
                <input type="email" value={einvoiceEmail} onChange={e => setEinvoiceEmail(e.target.value)} placeholder="VD: ketoan@vietfin.vn" />
              </div>
            </div>
            <div className="einvoice-field">
              <label>Địa chỉ công ty (theo đăng ký kinh doanh)</label>
              <input type="text" value={einvoiceAddress} onChange={e => setEinvoiceAddress(e.target.value)} placeholder="Nhập địa chỉ nhận hóa đơn" />
            </div>
            <div className="einvoice-field">
              <label>Ghi chú trên hóa đơn (tùy chọn)</label>
              <input type="text" value={einvoiceNote} onChange={e => setEinvoiceNote(e.target.value)} placeholder="VD: Mã hợp đồng, bộ phận nhận..." />
            </div>
            <div className="invoice-modal-actions">
              <button type="button" className="invoice-cancel-btn" onClick={() => setShowInvoiceModal(false)}>Hủy</button>
              <button type="button" className="primary-button" onClick={() => { setShowInvoiceModal(false); showNotice("Đã lưu thông tin xuất hóa đơn VAT"); }}>Lưu thông tin hóa đơn</button>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

function UsageRecordsTable({ tab, search, onSearch, timeFilter, onTimeFilter, page, setPage, pageSize, setPageSize, showNotice }: {
  tab: AnalyticsTab;
  search: string;
  onSearch: (value: string) => void;
  timeFilter: string;
  onTimeFilter: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  showNotice: (message: string) => void;
}) {
  const data = usageTableData[tab];
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [selectedBank, setSelectedBank] = useState("Tất cả ngân hàng");

  function autoWidthFor(index: number) {
    const colName = data.columns[index] || "";
    const colLower = colName.toLowerCase();
    const values = [colName, ...data.rows.map(row => row[index] ?? "")];
    const longest = Math.max(...values.map(value => String(value).length));

    let minWidth = 95;
    let extra = 38;

    if (colName === "STT") {
      return 60;
    }
    if (colLower.includes("ngân hàng") || colLower.includes("bank")) {
      minWidth = 165;
      extra = 65;
    } else if (colLower.includes("status") || colLower.includes("trạng thái") || colLower.includes("thông báo")) {
      minWidth = 120;
      extra = 48;
    } else if (colLower.includes("direct url") || colLower.includes("url") || colLower.includes("endpoint")) {
      minWidth = 280;
      extra = 45;
    } else if (colLower.includes("tên") || colLower.includes("người nhận") || colLower.includes("tài khoản")) {
      minWidth = 165;
      extra = 42;
    } else if (colLower.includes("ngày") || colLower.includes("thời gian")) {
      minWidth = 165;
      extra = 42;
    } else if (colLower.includes("số tiền") || colLower.includes("giá trị") || colLower.includes("chi phí")) {
      minWidth = 135;
      extra = 42;
    } else if (colLower.includes("nội dung") || colLower.includes("reference")) {
      minWidth = 190;
      extra = 42;
    } else if (colLower.includes("id")) {
      minWidth = 145;
      extra = 42;
    }

    const calculated = longest * 8 + extra;
    return Math.max(minWidth, calculated);
  }

  const [columnWidths, setColumnWidths] = useState(() => data.columns.map((_, index) => autoWidthFor(index)));
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);

  useEffect(() => {
    setColumnWidths(data.columns.map((_, index) => autoWidthFor(index)));
    setSelectedStatus("Tất cả trạng thái");
    setSelectedBank("Tất cả ngân hàng");
  }, [tab]);

  const statusValues = ["New", "Accepted", "Active", "Inactive", "Paused", "Deleted", "Success", "Failed", "Processing", "Paid", "Pending", "Expired", "Cancelled", "Verified", "Rejected", "Issued", "Delivered", "Retrying", "Chưa phát sinh"];
  const bankMarks: Record<string, string> = { Techcombank: "TCB", Vietcombank: "VCB", "MB Bank": "MB", ACB: "ACB", BIDV: "BIDV", Sacombank: "STB", VietinBank: "VTB", VPBank: "VPB", TPBank: "TPB" };

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    data.rows.forEach(row => row.forEach(cell => {
      if (statusValues.includes(cell)) set.add(cell);
    }));
    return Array.from(set);
  }, [data.rows]);

  const availableBanks = useMemo(() => {
    const set = new Set<string>();
    data.rows.forEach(row => row.forEach(cell => {
      if (bankMarks[cell]) set.add(cell);
    }));
    return Array.from(set);
  }, [data.rows]);

  const filtered = useMemo(() => {
    return data.rows.filter(row => {
      const rowString = row.join(" ").toLowerCase();
      if (search && !rowString.includes(search.toLowerCase())) return false;
      if (selectedStatus !== "Tất cả trạng thái" && !row.includes(selectedStatus)) return false;
      if (selectedBank !== "Tất cả ngân hàng" && !row.includes(selectedBank)) return false;

      const dateCell = row[row.length - 1] || "";
      if (timeFilter === "24 giờ qua") {
        return dateCell.includes("24/07/2026") || dateCell.includes("24/07");
      }
      if (timeFilter === "7 ngày qua") {
        return !dateCell.includes("/06/") && !dateCell.includes("/05/") && !dateCell.includes("17/07/");
      }
      if (timeFilter === "Tháng 07/2026") {
        return dateCell.includes("07/2026") || dateCell.includes("/07") || (!dateCell.includes("/06") && !dateCell.includes("/05"));
      }
      if (timeFilter === "Tháng 06/2026") {
        return dateCell.includes("06/2026") || dateCell.includes("/06");
      }
      if (timeFilter === "Tháng 05/2026") {
        return dateCell.includes("05/2026") || dateCell.includes("/05");
      }
      return true;
    });
  }, [data.rows, search, selectedStatus, selectedBank, timeFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportRows() {
    const csv = [data.columns, ...filtered].map(columns => columns.map(value => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `cas-${tab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice(`Đã xuất ${filtered.length} dòng ${tab}`);
  }

  return <div className="excel-section usage-records">
    <div className="excel-heading">
      <div className="excel-title"><h3>{data.title}</h3><p>{timeFilter} · {filtered.length} bản ghi</p></div>
      <div className="excel-actions">
        <label className="compact-search table-search"><span>⌕</span><input value={search} onChange={e => { onSearch(e.target.value); setPage(1); }} placeholder={`Tìm trong danh sách ${usageTabLabel(tab)}…`} /></label>
        {availableStatuses.length > 0 && (
          <select className="table-month-filter" value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setPage(1); }} aria-label="Lọc trạng thái">
            <option value="Tất cả trạng thái">Tất cả trạng thái</option>
            {availableStatuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        )}
        {availableBanks.length > 0 && (
          <select className="table-month-filter" value={selectedBank} onChange={e => { setSelectedBank(e.target.value); setPage(1); }} aria-label="Lọc ngân hàng">
            <option value="Tất cả ngân hàng">Tất cả ngân hàng</option>
            {availableBanks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        <select className="table-month-filter" value={timeFilter} onChange={e => { onTimeFilter(e.target.value); setPage(1); }} aria-label="Thời gian dữ liệu">
          <option value="24 giờ qua">24 giờ qua</option>
          <option value="7 ngày qua">7 ngày qua</option>
          <option value="Tháng 07/2026">Tháng 07/2026</option>
          <option value="Tháng 06/2026">Tháng 06/2026</option>
          <option value="Tháng 05/2026">Tháng 05/2026</option>
        </select>
        <button className="excel-export" onClick={exportRows}>▦ Xuất Excel</button>
      </div>
    </div>
    <div className="compact-table-wrap">
      <table className={`compact-table excel-table tailored-table tailored-${tab.toLowerCase()}`} style={{ width: `${columnWidths.reduce((sum, width) => sum + width, 0)}px`, minWidth: "100%" }}>
        <colgroup>{columnWidths.map((width, index) => <col key={data.columns[index]} style={{ width: `${width}px` }} />)}</colgroup>
        <thead><tr>{data.columns.map((column, index) => <th className={resizingColumn === index ? "resizing" : ""} key={column}><span>{column}</span><i className="column-resizer" role="separator" aria-label={`Thay đổi chiều rộng cột ${column}`} aria-orientation="vertical" onPointerDown={e => { setResizingColumn(index); e.currentTarget.dataset.startX = String(e.clientX); e.currentTarget.dataset.startWidth = String(columnWidths[index]); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; const startX = Number(e.currentTarget.dataset.startX); const startWidth = Number(e.currentTarget.dataset.startWidth); setColumnWidths(widths => widths.map((width, columnIndex) => columnIndex === index ? Math.max(55, startWidth + e.clientX - startX) : width)); }} onPointerUp={e => { setResizingColumn(null); e.currentTarget.releasePointerCapture(e.pointerId); }} onDoubleClick={() => setColumnWidths(widths => widths.map((width, columnIndex) => columnIndex === index ? autoWidthFor(index) : width))} /></th>)}</tr></thead>
        <tbody>{visible.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} onClick={() => showNotice(`Đã mở ${tab === "Connection" ? row[1] : row[0]}`)}>
          {row.map((cell, cellIndex) => <td key={cellIndex} title={cell}>
            {statusValues.includes(cell)
              ? <span className={`usage-status ${cell.toLowerCase()}`}><i />{cell}</span>
              : data.columns[cellIndex].includes("Ngân hàng")
                ? <span className="bank-name"><i className={`bank-mark bank-${cell.toLowerCase().replaceAll(" ", "-")}`}>{bankMarks[cell] ?? cell.slice(0, 2).toUpperCase()}</i>{cell}</span>
                : data.columns[cellIndex] === "Số tiền" || data.columns[cellIndex] === "Giá trị"
                  ? <span className={cell.startsWith("-") ? "amount-negative" : cell.startsWith("+") ? "amount-positive" : "amount-val"}>{cell}</span>
                  : data.columns[cellIndex].toLowerCase().includes("id")
                    ? <strong>{cell}</strong>
                    : cell}
          </td>)}
        </tr>)}</tbody>
      </table>
      {visible.length === 0 && <div className="empty-result">Không có dữ liệu phù hợp với bộ lọc.</div>}
    </div>
    <div className="table-pagination">
      <span>Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length}</span>
      <label>Số dòng <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></label>
      <div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => <button className={currentPage === index + 1 ? "active" : ""} key={index} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>›</button></div>
    </div>

  </div>;
}

function LogsScreen({ logRecordsData, showNotice }: { logRecordsData: LogRecord[]; showNotice: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState("Tất cả API routes");
  const [responseCode, setResponseCode] = useState("Tất cả response");
  const [timeRange, setTimeRange] = useState("7 ngày qua");
  const [bank, setBank] = useState("Tất cả ngân hàng");
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [detailTab, setDetailTab] = useState<"request" | "response">("request");
  const [page, setPage] = useState(1);

  const filtered = logRecordsData.filter(log => {
    const searchText = `${log.requestId} ${log.grantId} ${log.endpoint} ${log.bank} ${log.scope}`.toLowerCase();
    return searchText.includes(query.toLowerCase())
      && (route === "Tất cả API routes" || log.endpoint === route)
      && (responseCode === "Tất cả response" || (responseCode === "2xx Thành công" ? log.http.startsWith("2") : !log.http.startsWith("2")))
      && (bank === "Tất cả ngân hàng" || log.bank === bank);
  });
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function resetFilters() {
    setQuery("");
    setRoute("Tất cả API routes");
    setResponseCode("Tất cả response");
    setTimeRange("7 ngày qua");
    setBank("Tất cả ngân hàng");
    setPage(1);
  }

  function exportLogs() {
    const rows = filtered.map(log => [log.requestId, log.method, log.endpoint, log.scope, log.grantId, log.bank, log.http, log.latency, log.createdAt]);
    const csv = [["Request ID", "Method", "Endpoint", "Scope", "Grant ID", "Ngân hàng", "HTTP", "Latency", "Ngày tạo"], ...rows]
      .map(columns => columns.map(value => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cas-request-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
    showNotice(`Đã xuất ${filtered.length} request logs`);
  }

  return <section className="logs-screen">
    <div className="logs-search-row">
      <select aria-label="Loại log"><option>Request Log</option><option>Webhook Log</option></select>
      <label><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Tìm bằng Request ID, Grant ID hoặc endpoint" /></label>
    </div>
    <div className="logs-filter-row">
      <div>
        <select value={route} onChange={e => { setRoute(e.target.value); setPage(1); }} aria-label="API routes"><option>Tất cả API routes</option>{[...new Set(logRecordsData.map(log => log.endpoint))].map(item => <option key={item}>{item}</option>)}</select>
        <select value={responseCode} onChange={e => { setResponseCode(e.target.value); setPage(1); }} aria-label="Response code"><option>Tất cả response</option><option>2xx Thành công</option><option>4xx / 5xx Lỗi</option></select>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} aria-label="Thời gian"><option>24 giờ qua</option><option>7 ngày qua</option><option>30 ngày qua</option></select>
        <select value={bank} onChange={e => { setBank(e.target.value); setPage(1); }} aria-label="Ngân hàng"><option>Tất cả ngân hàng</option>{[...new Set(logRecordsData.map(log => log.bank))].map(item => <option key={item}>{item}</option>)}</select>
      </div>
      <button className="logs-reset" onClick={resetFilters} title="Đặt lại bộ lọc" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, padding: 0, borderRadius: 6, cursor: "pointer", color: "#4b5563" }}>
        <RotateIcon size={18} />
      </button>
      <button className="logs-export" onClick={exportLogs}>Xuất logs</button>
    </div>
    <div className="logs-table-wrap">
      <table className="logs-table">
        <thead>
          <tr>
            <th style={{ width: "240px" }}>REQUEST ID</th>
            <th style={{ width: "160px" }}>NGÂN HÀNG</th>
            <th style={{ width: "150px" }}>TRẠNG THÁI HTTP</th>
            <th style={{ width: "220px" }}>ĐƯỜNG DẪN REQUEST</th>
            <th style={{ width: "180px" }}>GRANT ID</th>
            <th>NGÀY TẠO</th>
          </tr>
        </thead>
        <tbody>{visible.map(log => <tr key={log.requestId} tabIndex={0} onClick={() => { setSelectedLog(log); setDetailTab("request"); }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelectedLog(log); }}>
          <td><strong style={{ color: "#000", fontSize: 13.5, fontFamily: "monospace" }}>{log.requestId}</strong></td>
          <td style={{ color: "#000" }}>{log.bank}</td>
          <td><span className={`log-http ${log.http.startsWith("2") ? "success" : "failed"}`}>{log.http.startsWith("2") ? "✓" : "×"} {log.http}</span></td>
          <td><code style={{ color: "#000", fontFamily: "monospace", fontSize: 13 }}>{log.endpoint}</code></td>
          <td><code style={{ color: "#000", fontFamily: "monospace", fontSize: 13 }}>{log.grantId}</code></td>
          <td style={{ color: "#000" }}>{log.createdAt}</td>
        </tr>)}</tbody>
      </table>
      {visible.length === 0 && <div className="empty-result">Không tìm thấy request log phù hợp.</div>}
    </div>
    <div className="logs-pagination">
      <span>Hiển thị {visible.length} / {filtered.length} logs</span>
      <div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => <button className={currentPage === index + 1 ? "active" : ""} key={index} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>›</button></div>
    </div>

    {selectedLog && <div className="log-drawer-backdrop" onMouseDown={() => setSelectedLog(null)}>
      <aside className="log-drawer" role="dialog" aria-modal="true" aria-labelledby="log-detail-title" onMouseDown={e => e.stopPropagation()}>
        <div className="log-drawer-heading"><div><span>REQUEST LOG</span><h2 id="log-detail-title">{selectedLog.requestId}</h2></div><button aria-label="Đóng" onClick={() => setSelectedLog(null)}>×</button></div>
        <div className="log-overview">
          <div><span>Trạng thái</span><strong><i className={selectedLog.http.startsWith("2") ? "ok" : "error"} />HTTP {selectedLog.http}</strong></div>
          <div><span>Thời gian xử lý</span><strong>{selectedLog.latency}</strong></div>
          <div><span>Thời gian gọi</span><strong>{selectedLog.createdAt}</strong></div>
        </div>
        <dl className="log-metadata">
          <div><dt>Request</dt><dd><b className={`method ${selectedLog.method.toLowerCase()}`}>{selectedLog.method}</b><code>{selectedLog.endpoint}</code></dd></div>
          <div><dt>Grant ID</dt><dd><code>{selectedLog.grantId}</code></dd></div>
          <div><dt>Scope</dt><dd>{selectedLog.scope}</dd></div>
          <div><dt>Ngân hàng</dt><dd>{selectedLog.bank}</dd></div>
        </dl>
        <div className="log-detail-tabs"><button className={detailTab === "request" ? "active" : ""} onClick={() => setDetailTab("request")}>Request</button><button className={detailTab === "response" ? "active" : ""} onClick={() => setDetailTab("response")}>Response</button></div>
        <div className="log-code-section">
          <div>
            <span>{detailTab === "request" ? "Request body" : "Response body"}</span>
            <button onClick={() => { navigator.clipboard?.writeText(detailTab === "request" ? selectedLog.requestBody : selectedLog.responseBody); showNotice("Đã sao chép JSON"); }}>
              Sao chép
            </button>
          </div>
          <pre>
            <code
              dangerouslySetInnerHTML={{
                __html: (() => {
                  try {
                    const raw = detailTab === "request" ? selectedLog.requestBody : selectedLog.responseBody;
                    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                    const formatted = JSON.stringify(parsed, null, 2);
                    return formatted
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
                        let style = "color: #fde047;";
                        if (/^"/.test(match)) {
                          if (/:$/.test(match)) {
                            style = "color: #93c5fd; font-weight: 600;";
                          } else {
                            style = "color: #86efac;";
                          }
                        } else if (/true|false/.test(match)) {
                          style = "color: #f472b6; font-weight: 600;";
                        } else if (/null/.test(match)) {
                          style = "color: #94a3b8; font-style: italic;";
                        }
                        return `<span style="${style}">${match}</span>`;
                      });
                  } catch {
                    return detailTab === "request" ? selectedLog.requestBody : selectedLog.responseBody;
                  }
                })(),
              }}
            />
          </pre>
        </div>
        <div className="log-headers">
          <h3>Headers</h3>
          <div><span>x-request-id</span><code>{selectedLog.requestId}</code></div>
          <div><span>x-client-id</span><code>33d42bee-••••-••••-••••-51e958e065ae</code></div>
          <div><span>content-type</span><code>application/json</code></div>
        </div>
      </aside>
    </div>}
  </section>;
}

function IntroOverviewScreen({
  onNavigate,
  showNotice,
}: {
  onNavigate: (page: string) => void;
  showNotice: (msg: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40, maxWidth: 1080 }}>
      {/* Hero Intro Banner - Sleek Minimalist Black */}
      <section
        style={{
          background: "#000000",
          color: "white",
          borderRadius: 10,
          padding: "28px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          border: "1px solid #27272a",
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 4, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, color: "#e4e4e7" }}>
            CAS OPEN BANKING PLATFORM
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.3, color: "#ffffff" }}>
            Tài liệu & Giới thiệu Nền tảng Cas SDK
          </h1>
          <p style={{ fontSize: 14, margin: 0, color: "#a1a1aa", lineHeight: 1.6 }}>
            Cas cung cấp giải pháp kết nối Open Banking trực tiếp với hệ sinh thái ngân hàng Việt Nam (Vietcombank, Techcombank, MB, BIDV, ACB, VietinBank...). Tích hợp an toàn, đối soát tự động và vận hành 24/7.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          <a
            href="https://cas.so/intro"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "white",
              color: "#000000",
              padding: "9px 18px",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              justifyContent: "center",
            }}
          >
            Xem tài liệu
          </a>
          <a
            href="https://cas.so/demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid #3f3f46",
              padding: "9px 18px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              justifyContent: "center",
            }}
          >
            Xem Demo
          </a>
        </div>
      </section>

      {/* Developer Configuration Guides: Keys, RedirectURI, IP, Webhooks */}
      <section style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: "22px 24px" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
            Hướng dẫn thiết lập cấu hình kết nối
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Tổng quan các mục cấu hình cần thiết để kết nối và vận hành ứng dụng trên nền tảng Cas.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {/* Card 1: Keys */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff" }}>
            <div>
              <strong style={{ fontSize: 15, color: "#0f172a", display: "block", marginBottom: 8 }}>
                Keys
              </strong>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                Quản lý Client ID và Secret Key dùng để xác thực ứng dụng khi gọi API và mở giao diện liên kết Cas Link.
              </p>
            </div>
            <button
              onClick={() => onNavigate("Keys")}
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: "1px solid #cbd5e1",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Cấu hình Keys
            </button>
          </div>

          {/* Card 2: RedirectURI */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff" }}>
            <div>
              <strong style={{ fontSize: 15, color: "#0f172a", display: "block", marginBottom: 8 }}>
                RedirectURI
              </strong>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                Cấu hình danh sách URL callback hoặc Mobile Deeplink để chuyển hướng người dùng quay về sau khi hoàn thành cấp quyền.
              </p>
            </div>
            <button
              onClick={() => onNavigate("RedirectURI/IP")}
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: "1px solid #cbd5e1",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Cấu hình RedirectURI
            </button>
          </div>

          {/* Card 3: Cấu hình IP */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff" }}>
            <div>
              <strong style={{ fontSize: 15, color: "#0f172a", display: "block", marginBottom: 8 }}>
                Cấu hình IP
              </strong>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                Danh sách các địa chỉ IP tĩnh hoặc dải IP của máy chủ được cấp phép truy cập API chuyển tiền.
              </p>
            </div>
            <button
              onClick={() => onNavigate("RedirectURI/IP")}
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: "1px solid #cbd5e1",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Cấu hình IP
            </button>
          </div>

          {/* Card 4: Webhooks */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff" }}>
            <div>
              <strong style={{ fontSize: 15, color: "#0f172a", display: "block", marginBottom: 8 }}>
                Webhooks
              </strong>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                Thiết lập các URL endpoint nhận thông báo tự động theo thời gian thực khi có biến động báo có giao dịch, ký số, ...
              </p>
            </div>
            <button
              onClick={() => onNavigate("Webhooks")}
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: "1px solid #cbd5e1",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#0f172a",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Cấu hình Webhooks
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppSettingsScreen({
  selectedApp,
  setSelectedApp,
  showNotice,
}: {
  selectedApp: AppData;
  setSelectedApp: React.Dispatch<React.SetStateAction<AppData>>;
  showNotice: (msg: string) => void;
}) {
  const [appName, setAppName] = useState(selectedApp.name);
  const [appDesc, setAppDesc] = useState("Test");
  const [appWebsite, setAppWebsite] = useState("https://casso.vn");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  function handleSave() {
    setSelectedApp(prev => ({ ...prev, name: appName }));
    showNotice("✓ Đã lưu thông tin ứng dụng thành công!");
  }

  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: "10px 0 40px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
        Chi tiết ứng dụng
      </h1>
      <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.5, margin: "0 0 28px 0" }}>
        Một ứng dụng mới sẽ có một cặp client, secret key để các team có thể ứng dụng tích hợp các tính năng
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Field: Tên ứng dụng */}
        <fieldset
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            padding: "0 14px 10px 14px",
            margin: 0,
          }}
        >
          <legend style={{ padding: "0 6px", fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
            Tên ứng dụng *
          </legend>
          <input
            type="text"
            value={appName}
            onChange={e => setAppName(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 16,
              fontWeight: 500,
              color: "#0f172a",
              background: "transparent",
              padding: "4px 0 0 0",
              boxSizing: "border-box",
            }}
          />
        </fieldset>

        {/* Field: Mô tả */}
        <fieldset
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            padding: "0 14px 10px 14px",
            margin: 0,
          }}
        >
          <legend style={{ padding: "0 6px", fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
            Mô tả *
          </legend>
          <input
            type="text"
            value={appDesc}
            onChange={e => setAppDesc(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 16,
              fontWeight: 500,
              color: "#0f172a",
              background: "transparent",
              padding: "4px 0 0 0",
              boxSizing: "border-box",
            }}
          />
        </fieldset>

        {/* Field: Trang web liên quan */}
        <fieldset
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            padding: "0 14px 10px 14px",
            margin: 0,
          }}
        >
          <legend style={{ padding: "0 6px", fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
            Trang web liên quan *
          </legend>
          <input
            type="text"
            value={appWebsite}
            onChange={e => setAppWebsite(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 16,
              fontWeight: 500,
              color: "#0f172a",
              background: "transparent",
              padding: "4px 0 0 0",
              boxSizing: "border-box",
            }}
          />
        </fieldset>

        {/* Field: Logo */}
        <div>
          <fieldset
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "14px",
              margin: 0,
            }}
          >
            <legend style={{ padding: "0 6px", fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
              Logo
            </legend>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <label
                style={{
                  width: "100%",
                  border: "1px solid #0f172a",
                  borderRadius: 4,
                  padding: "8px 0",
                  textAlign: "center",
                  background: "white",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "block",
                }}
              >
                Cập nhật
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setLogoPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                      showNotice(`Đã chọn ảnh logo: ${file.name}`);
                    }
                  }}
                />
              </label>

              <div
                style={{
                  width: "100%",
                  minHeight: 180,
                  maxHeight: 280,
                  background: "#fafafa",
                  borderRadius: 4,
                  border: "1px dashed #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: 10,
                }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="App Logo Preview" style={{ maxWidth: "100%", maxHeight: 240, objectFit: "contain" }} />
                ) : (
                  <div style={{ textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>🖼</div>
                    <span>Chưa có ảnh logo tải lên</span>
                  </div>
                )}
              </div>
            </div>
          </fieldset>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, paddingLeft: 4 }}>
            Hình ảnh phải có kích thước nhỏ hơn 1MB và file .jpg, jpeg, png
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            marginTop: 10,
            background: "#646b79",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            width: "100%",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#4b5563")}
          onMouseLeave={e => (e.currentTarget.style.background = "#646b79")}
        >
          <span>Lưu thay đổi</span>
        </button>
      </div>
    </section>
  );
}

function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

function RotateIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
  );
}

function WarningTriangleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function EditIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}

function ApiKeysScreen({ showNotice }: { showNotice: (message: string) => void }) {
  const [showSecret, setShowSecret] = useState(false);
  const [clientId] = useState("33d42bee-13b4-4f33-b528-51e958e065ae");
  const [secretKey, setSecretKey] = useState("sk_live_991823abce_vietfin_sec88_cas_d912");

  function handleRotateSecret() {
    const newSecret = `sk_live_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 10)}`;
    setSecretKey(newSecret);
    showNotice("✓ Đã xoay vòng Secret Key mới thành công!");
  }

  return (
    <div style={{ maxWidth: 1080, padding: "10px 0 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#000" }}>Keys</h1>
      </div>

      {/* Client ID Row */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        <div style={{ width: 140, fontSize: 14, fontWeight: 500, color: "#000", flexShrink: 0 }}>Client Id</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            border: "1px solid #d1d5db",
            borderRadius: 4,
            padding: "8px 14px",
            background: "#fff",
          }}
        >
          <span style={{ flex: 1, fontFamily: "monospace", fontSize: 14, color: "#111827" }}>{clientId}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(clientId);
              showNotice("✓ Đã sao chép Client ID vào clipboard");
            }}
            title="Sao chép Client ID"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
          >
            <CopyIcon size={18} />
          </button>
        </div>
      </div>

      {/* Secrets Section */}
      <div style={{ marginBottom: 12 }}>
        {/* Warning Banner */}
        <div
          style={{
            marginLeft: 140,
            border: "1px solid #f97316",
            borderRadius: 4,
            padding: "12px 16px",
            background: "#fff",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <WarningTriangleIcon size={18} />
          </div>
          <div style={{ fontSize: 13.5, color: "#9a3412", lineHeight: 1.5 }}>
            Đừng bao giờ chia sẻ secret key với bất kỳ ai, kể cả chúng tôi. Nếu một key bị lộ, hãy xoay vòng key đó ngay lập tức.
          </div>
        </div>

        {/* Secret Key Row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 140, fontSize: 14, fontWeight: 500, color: "#000", flexShrink: 0 }}>Secret key</div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "8px 14px",
              background: "#fff",
            }}
          >
            <span
              style={{
                flex: 1,
                fontFamily: "monospace",
                fontSize: 14,
                color: "#111827",
                letterSpacing: showSecret ? "normal" : "2px",
              }}
            >
              {showSecret ? secretKey : "................................"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(secretKey);
                  showNotice("✓ Đã sao chép Secret Key vào clipboard");
                }}
                title="Sao chép Secret Key"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", padding: "4px" }}
              >
                <CopyIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                title={showSecret ? "Ẩn Secret Key" : "Hiện Secret Key"}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", padding: "4px" }}
              >
                {showSecret ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
              <button
                type="button"
                onClick={handleRotateSecret}
                title="Xoay vòng (tạo mới) Secret Key"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", padding: "4px" }}
              >
                <RotateIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiSettingsScreen({ showNotice }: { showNotice: (message: string) => void }) {
  // Redirect URLs state
  const [urls, setUrls] = useState<string[]>([
    "https://bankhub.vn/cas/callback",
    "vietfin://cas/auth/callback",
    "https://staging.bankhub.vn/auth/callback",
  ]);
  const [newUrl, setNewUrl] = useState("");
  const [editingUrlIdx, setEditingUrlIdx] = useState<number | null>(null);
  const [editingUrlValue, setEditingUrlValue] = useState("");

  // IP Whitelist state
  const [ips, setIps] = useState<string[]>([
    "118.69.182.45",
    "14.162.144.89",
    "203.162.0.1/24",
  ]);
  const [newIp, setNewIp] = useState("");
  const [editingIpIdx, setEditingIpIdx] = useState<number | null>(null);
  const [editingIpValue, setEditingIpValue] = useState("");

  // Redirect URI Handlers
  function handleAddUrl() {
    if (!newUrl.trim()) return;
    if (urls.includes(newUrl.trim())) {
      showNotice("URI này đã tồn tại trong danh sách.");
      return;
    }
    setUrls([...urls, newUrl.trim()]);
    setNewUrl("");
    showNotice("✓ Đã thêm Redirect URI mới");
  }

  function handleStartEditUrl(idx: number) {
    setEditingUrlIdx(idx);
    setEditingUrlValue(urls[idx]);
  }

  function handleSaveEditUrl(idx: number) {
    if (!editingUrlValue.trim()) return;
    const updated = [...urls];
    updated[idx] = editingUrlValue.trim();
    setUrls(updated);
    setEditingUrlIdx(null);
    setEditingUrlValue("");
    showNotice("✓ Đã cập nhật Redirect URI");
  }

  function handleDeleteUrl(idx: number) {
    setUrls(urls.filter((_, i) => i !== idx));
    showNotice("✓ Đã xoá Redirect URI");
  }

  // IP Whitelist Handlers
  function handleAddIp() {
    if (!newIp.trim()) return;
    if (ips.includes(newIp.trim())) {
      showNotice("Địa chỉ IP này đã tồn tại trong whitelist.");
      return;
    }
    setIps([...ips, newIp.trim()]);
    setNewIp("");
    showNotice("✓ Đã thêm IP vào Whitelist");
  }

  function handleStartEditIp(idx: number) {
    setEditingIpIdx(idx);
    setEditingIpValue(ips[idx]);
  }

  function handleSaveEditIp(idx: number) {
    if (!editingIpValue.trim()) return;
    const updated = [...ips];
    updated[idx] = editingIpValue.trim();
    setIps(updated);
    setEditingIpIdx(null);
    setEditingIpValue("");
    showNotice("✓ Đã cập nhật địa chỉ IP");
  }

  function handleDeleteIp(idx: number) {
    setIps(ips.filter((_, i) => i !== idx));
    showNotice("✓ Đã xoá IP khỏi Whitelist");
  }

  return (
    <div style={{ maxWidth: 1080, padding: "10px 0 40px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#000" }}>RedirectURI/IP</h1>
      </div>

      {/* SECTION 1: Redirect URIs */}
      <section style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: "20px 22px" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#000" }}>
            URI điều hướng được cho phép
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            URI điều hướng trả lại quyền kiểm soát cho ứng dụng của bạn sau khi người dùng liên kết tài khoản.
          </p>
        </div>

        {/* List of Redirect URIs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {urls.map((url, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                gap: 12,
              }}
            >
              {editingUrlIdx === idx ? (
                <div style={{ display: "flex", flex: 1, gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    value={editingUrlValue}
                    onChange={e => setEditingUrlValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleSaveEditUrl(idx);
                      if (e.key === "Escape") setEditingUrlIdx(null);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      border: "1px solid #000",
                      borderRadius: 4,
                      fontSize: 13.5,
                      fontFamily: "monospace",
                      background: "#fff",
                    }}
                  />
                  <button
                    onClick={() => handleSaveEditUrl(idx)}
                    style={{ background: "#000", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingUrlIdx(null)}
                    style={{ background: "#f3f4f6", color: "#4b5563", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <code style={{ fontSize: 13.5, color: "#111827", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {url}
                  </code>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(url);
                        showNotice("✓ Đã sao chép Redirect URI");
                      }}
                      title="Sao chép"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                    >
                      <CopyIcon size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditUrl(idx)}
                      title="Chỉnh sửa"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                    >
                      <EditIcon size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUrl(idx)}
                      title="Xóa"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {urls.length === 0 && (
            <div style={{ textAlign: "center", padding: "16px", color: "#9ca3af", fontSize: 13, background: "#f9fafb", borderRadius: 6, border: "1px dashed #d1d5db" }}>
              Chưa có URI điều hướng nào được cấu hình.
            </div>
          )}
        </div>

        {/* Add new Redirect URI Input Row */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="https://yourdomain.com/callback hoặc myapp://cas/callback..."
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddUrl(); }}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13.5, background: "#fff", color: "#111827" }}
          />
          <button
            onClick={handleAddUrl}
            style={{ background: "#000", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Thêm URI
          </button>
        </div>
      </section>

      {/* SECTION 2: IP Whitelist */}
      <section style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: "20px 22px" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#000" }}>
            Cấu hình IP
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Chỉ các địa chỉ IP hoặc dải CIDR nằm trong danh sách whitelist này mới được phép sử dụng API chuyển tiền.
          </p>
        </div>

        {/* List of IPs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {ips.map((ip, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                gap: 12,
              }}
            >
              {editingIpIdx === idx ? (
                <div style={{ display: "flex", flex: 1, gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    value={editingIpValue}
                    onChange={e => setEditingIpValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleSaveEditIp(idx);
                      if (e.key === "Escape") setEditingIpIdx(null);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      border: "1px solid #000",
                      borderRadius: 4,
                      fontSize: 13.5,
                      fontFamily: "monospace",
                      background: "#fff",
                    }}
                  />
                  <button
                    onClick={() => handleSaveEditIp(idx)}
                    style={{ background: "#000", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingIpIdx(null)}
                    style={{ background: "#f3f4f6", color: "#4b5563", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <code style={{ fontSize: 13.5, color: "#111827", fontFamily: "monospace", fontWeight: 600 }}>
                    {ip}
                  </code>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(ip);
                        showNotice("✓ Đã sao chép địa chỉ IP");
                      }}
                      title="Sao chép"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                    >
                      <CopyIcon size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditIp(idx)}
                      title="Chỉnh sửa"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                    >
                      <EditIcon size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteIp(idx)}
                      title="Xóa"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {ips.length === 0 && (
            <div style={{ textAlign: "center", padding: "16px", color: "#9ca3af", fontSize: 13, background: "#f9fafb", borderRadius: 6, border: "1px dashed #d1d5db" }}>
              Chưa có IP nào trong Whitelist.
            </div>
          )}
        </div>

        {/* Add new IP Input Row */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Ví dụ: 118.69.182.45 hoặc 10.0.0.0/24..."
            value={newIp}
            onChange={e => setNewIp(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddIp(); }}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13.5, background: "#fff", color: "#111827" }}
          />
          <button
            onClick={handleAddIp}
            style={{ background: "#000", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Thêm IP
          </button>
        </div>
      </section>
    </div>
  );
}

type WebhookItem = {
  id: string;
  name: string;
  description?: string;
  url: string;
  category: "GRANT" | "TRANSACTIONS" | "INVOICE" | "AUTO_DEBIT" | "TVAN" | "SIGN";
  status: "ACTIVE" | "PAUSED";
};

function WebhooksScreen({ showNotice }: { showNotice: (message: string) => void }) {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: "wh_1",
      name: "Báo có",
      description: "Nhận biến động giao dịch tức thì",
      url: "https://webhook.site/8897849f-5f17-4ad0-bb32-0df45b66230e",
      category: "TRANSACTIONS",
      status: "ACTIVE",
    },
    {
      id: "wh_2",
      name: "Sign",
      description: "Nhận kết quả ký số eSign",
      url: "https://cas-sign.canhpham0809.workers.dev/api/esign/webhook?token=82f6e4f0437b7f5b406356a8f148e16dd9c7c8853173f313d12763e47da9122a",
      category: "SIGN",
      status: "ACTIVE",
    },
  ]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WebhookItem | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftCategory, setDraftCategory] = useState<WebhookItem["category"]>("GRANT");

  function openCreate() {
    setEditingItem(null);
    setDraftName("");
    setDraftDesc("");
    setDraftUrl("");
    setDraftCategory("GRANT");
    setModalOpen(true);
  }

  function openEdit(item: WebhookItem) {
    setEditingItem(item);
    setDraftName(item.name);
    setDraftDesc(item.description || "");
    setDraftUrl(item.url);
    setDraftCategory(item.category);
    setModalOpen(true);
  }

  function handleSave() {
    if (!draftName.trim() || !draftUrl.trim()) {
      showNotice("Vui lòng nhập đầy đủ Tên và Đường dẫn Webhook.");
      return;
    }

    if (editingItem) {
      setWebhooks(webhooks.map(w => w.id === editingItem.id ? {
        ...w,
        name: draftName.trim(),
        description: draftDesc.trim(),
        url: draftUrl.trim(),
        category: draftCategory,
      } : w));
      showNotice("✓ Đã cập nhật Webhook thành công!");
    } else {
      const newItem: WebhookItem = {
        id: `wh_${Date.now()}`,
        name: draftName.trim(),
        description: draftDesc.trim(),
        url: draftUrl.trim(),
        category: draftCategory,
        status: "ACTIVE",
      };
      setWebhooks([...webhooks, newItem]);
      showNotice("✓ Đã thêm Webhook mới thành công!");
    }
    setModalOpen(false);
  }

  function handleTogglePause(id: string) {
    setWebhooks(webhooks.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
        showNotice(nextStatus === "PAUSED" ? `✓ Đã tạm dừng webhook "${w.name}"` : `✓ Đã kích hoạt lại webhook "${w.name}"`);
        return { ...w, status: nextStatus };
      }
      return w;
    }));
  }

  function handleDelete(id: string) {
    setWebhooks(webhooks.filter(w => w.id !== id));
    showNotice("✓ Đã xoá Webhook.");
  }

  function handleTest(item: WebhookItem) {
    showNotice(`✓ Đã gửi test webhook "${item.name}" (HTTP 200 OK)`);
  }

  return (
    <div style={{ maxWidth: 1080, padding: "10px 0 40px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#000" }}>Webhooks</h1>
        <button
          onClick={openCreate}
          style={{
            background: "#000",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Thêm Webhook
        </button>
      </div>

      {/* Webhook List Section */}
      <section style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--line)" }}>
                <th style={{ padding: "12px 20px", color: "#6b7280", fontWeight: 600, fontSize: 12, width: "22%" }}>Webhook</th>
                <th style={{ padding: "12px 20px", color: "#6b7280", fontWeight: 600, fontSize: 12, width: "42%" }}>Đường dẫn (Endpoint)</th>
                <th style={{ padding: "12px 20px", color: "#6b7280", fontWeight: 600, fontSize: 12, width: "14%" }}>Phân loại</th>
                <th style={{ padding: "12px 20px", color: "#6b7280", fontWeight: 600, fontSize: 12, width: "10%", textAlign: "center" }}>Trạng thái</th>
                <th style={{ padding: "12px 20px", color: "#6b7280", fontWeight: 600, fontSize: 12, width: "12%", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <strong style={{ color: "#111827", fontSize: 13.5, display: "block" }}>{item.name}</strong>
                    {item.description && (
                      <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginTop: 2 }}>{item.description}</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <code style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: "4px 8px", borderRadius: 4, color: "#111827", fontFamily: "monospace", wordBreak: "break-all", fontSize: 12.5, display: "inline-block" }}>
                      {item.url}
                    </code>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: "#374151", background: "#f3f4f6", padding: "3px 8px", borderRadius: 4 }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center" }}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.status === "ACTIVE"}
                      onClick={() => handleTogglePause(item.id)}
                      title={item.status === "ACTIVE" ? "Đang bật (Gạt để tạm dừng)" : "Đang tắt (Gạt để kích hoạt)"}
                      style={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        width: 38,
                        height: 22,
                        flexShrink: 0,
                        cursor: "pointer",
                        borderRadius: 12,
                        border: "none",
                        transition: "background-color 0.2s ease-in-out",
                        backgroundColor: item.status === "ACTIVE" ? "#10b981" : "#cbd5e1",
                        padding: "2px",
                        outline: "none",
                      }}
                    >
                      <span
                        style={{
                          pointerEvents: "none",
                          display: "inline-block",
                          height: 18,
                          width: 18,
                          borderRadius: "50%",
                          backgroundColor: "white",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                          transition: "transform 0.2s ease-in-out",
                          transform: item.status === "ACTIVE" ? "translateX(16px)" : "translateX(0px)",
                        }}
                      />
                    </button>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleTest(item)}
                        title="Gửi test webhook"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#0284c7")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                      >
                        <PlayIcon size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(item.url);
                          showNotice("✓ Đã sao chép Webhook URL");
                        }}
                        title="Sao chép"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                      >
                        <CopyIcon size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        title="Chỉnh sửa"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="Xóa"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "28px", color: "#9ca3af" }}>
                    Chưa có Webhook nào. Bấm "Thêm Webhook" để tạo mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Popup Modal: Add / Edit Webhook */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 8,
              width: "100%",
              maxWidth: 540,
              padding: "24px 28px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {editingItem ? "Chỉnh sửa Webhook" : "Thêm Webhook"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Field 1: Tên */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Tên *
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tên của Webhook
                </span>
              </div>

              {/* Field 2: Mô tả */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Mô tả
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={draftDesc}
                  onChange={e => setDraftDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                  Mô tả cho Webhook
                </span>
              </div>

              {/* Field 3: Đường dẫn */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Đường dẫn *
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={draftUrl}
                  onChange={e => setDraftUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                  Url của Webhook
                </span>
              </div>

              {/* Field 4: Phân loại Webhook */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Phân loại Webhook *
                </label>
                <select
                  value={draftCategory}
                  onChange={e => setDraftCategory(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13.5,
                    background: "white",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="GRANT">GRANT</option>
                  <option value="TRANSACTIONS">TRANSACTIONS</option>
                  <option value="INVOICE">INVOICE</option>
                  <option value="AUTO_DEBIT">AUTO_DEBIT</option>
                  <option value="TVAN">TVAN</option>
                  <option value="SIGN">SIGN</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 26 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 6,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                style={{
                  background: "#000",
                  border: "none",
                  borderRadius: 6,
                  padding: "9px 22px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "white",
                }}
              >
                Lưu Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type GrantDebugData = {
  grantId: string;
  user?: string | null;
  bank?: string | null;
  accountNo?: string | null;
  scopes: string[];
  status: "Active" | "Paused" | "Revoked" | "Pending";
  createdAt: string;
  lastAccess: string;
  logs: {
    id: string;
    timestamp: string;
    endpoint: string;
    method: string;
    status: number;
    latency: string;
    requestId: string;
  }[];
};

const mockGrantsDb: Record<string, GrantDebugData> = {
  "grt_8L2KP91N": {
    grantId: "grt_8L2KP91N",
    user: "Nguyễn Minh Anh",
    bank: "Techcombank (TCB)",
    accountNo: "19038291048201",
    scopes: ["Transaction", "Balance", "Identity"],
    status: "Active",
    createdAt: "12/05/2026 09:24:12",
    lastAccess: "2 phút trước",
    logs: [
      { id: "log_01", timestamp: "19/08/2026 17:31:04", endpoint: "/v2/transactions", method: "GET", status: 200, latency: "284 ms", requestId: "req_8K2MP91N" },
      { id: "log_02", timestamp: "19/08/2026 17:28:10", endpoint: "/v2/balance", method: "GET", status: 200, latency: "198 ms", requestId: "req_8K2MP91N" },
      { id: "log_03", timestamp: "19/08/2026 16:45:22", endpoint: "/v2/identity", method: "POST", status: 200, latency: "412 ms", requestId: "req_7X9AB12C" },
      { id: "log_04", timestamp: "19/08/2026 14:10:05", endpoint: "/v2/transactions/sync", method: "POST", status: 200, latency: "310 ms", requestId: "req_4T7QD20A" },
      { id: "log_05", timestamp: "18/08/2026 21:05:40", endpoint: "/grant/token", method: "POST", status: 200, latency: "145 ms", requestId: "req_1A9VC63F" },
    ],
  },
  "grt_4T7MD20Q": {
    grantId: "grt_4T7MD20Q",
    user: "Trần Hoàng Long",
    bank: "Vietcombank (VCB)",
    accountNo: "0071001928491",
    scopes: ["Balance", "QRPay", "Transfer"],
    status: "Active",
    createdAt: "15/06/2026 14:10:00",
    lastAccess: "11 phút trước",
    logs: [
      { id: "log_11", timestamp: "19/08/2026 17:22:15", endpoint: "/v2/qr/create", method: "POST", status: 200, latency: "215 ms", requestId: "req_6P3RF82W" },
      { id: "log_12", timestamp: "19/08/2026 17:15:30", endpoint: "/v2/balance", method: "GET", status: 200, latency: "326 ms", requestId: "req_4T7QD20A" },
      { id: "log_13", timestamp: "19/08/2026 15:40:12", endpoint: "/v2/transfers", method: "POST", status: 200, latency: "650 ms", requestId: "req_8K2MP91N" },
    ],
  },
  "grt_1A9HC63V": {
    grantId: "grt_1A9HC63V",
    user: "Phạm Thùy Linh",
    bank: "MB Bank (MBB)",
    accountNo: "8829103948102",
    scopes: ["Identity", "eKYC"],
    status: "Paused",
    createdAt: "01/07/2026 10:00:00",
    lastAccess: "36 phút trước",
    logs: [
      { id: "log_21", timestamp: "19/08/2026 16:55:00", endpoint: "/v2/ekyc/verify", method: "POST", status: 429, latency: "580 ms", requestId: "req_1A9VC63F" },
      { id: "log_22", timestamp: "19/08/2026 16:50:00", endpoint: "/v2/ekyc/sessions", method: "POST", status: 200, latency: "490 ms", requestId: "req_1A9VC63F" },
    ],
  },
  "grt_9X2PENDING": {
    grantId: "grt_9X2PENDING",
    user: null,
    bank: null,
    accountNo: null,
    scopes: ["Transaction", "Balance"],
    status: "Pending",
    createdAt: "19/08/2026 18:00:00",
    lastAccess: "Chưa phát sinh",
    logs: [
      { id: "log_31", timestamp: "19/08/2026 18:00:00", endpoint: "/grant/init", method: "POST", status: 200, latency: "110 ms", requestId: "req_9X2INIT" },
    ],
  },
};

function GrantDebuggerScreen({ showNotice }: { showNotice: (message: string) => void }) {
  const [searchGrantId, setSearchGrantId] = useState("grt_8L2KP91N");
  const [activeGrant, setActiveGrant] = useState<GrantDebugData | null>(mockGrantsDb["grt_8L2KP91N"]);
  const [searched, setSearched] = useState(true);

  function handleSearch(idToSearch?: string) {
    const query = (idToSearch || searchGrantId).trim();
    if (!query) {
      showNotice("Vui lòng nhập Grant ID để tìm kiếm.");
      return;
    }
    const found = mockGrantsDb[query];
    if (found) {
      setActiveGrant(found);
      setSearched(true);
      showNotice(`✓ Đã tìm thấy log của Grant: ${query}`);
    } else {
      setActiveGrant(null);
      setSearched(true);
      showNotice(`Không tìm thấy dữ liệu cho Grant ID: ${query}`);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960, padding: "4px 0 30px" }}>
      {/* Search Header */}
      <section style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: "20px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
          Grant Debugger
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>
          Tra cứu thông tin và lịch sử các lượt gọi API của từng Grant ID.
        </p>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Nhập Grant ID (Ví dụ: grt_8L2KP91N, grt_4T7MD20Q, grt_9X2PENDING)..."
            value={searchGrantId}
            onChange={e => setSearchGrantId(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 13.5,
              fontFamily: "monospace",
              outline: "none",
            }}
          />
          <button
            onClick={() => handleSearch()}
            style={{
              background: "#000",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tra cứu
          </button>
        </div>
      </section>

      {/* Grant Details & Call Logs */}
      {activeGrant ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Grant Overview Card */}
          <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: activeGrant.user ? "#0f172a" : "#64748b" }}>
                    {activeGrant.user || "Chưa có thông tin người dùng"}
                  </h3>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color:
                        activeGrant.status === "Active"
                          ? "#16a34a"
                          : activeGrant.status === "Pending"
                            ? "#d97706"
                            : activeGrant.status === "Paused"
                              ? "#d97706"
                              : "#dc2626",
                      background:
                        activeGrant.status === "Active"
                          ? "#dcfce7"
                          : activeGrant.status === "Pending"
                            ? "#fef3c7"
                            : activeGrant.status === "Paused"
                              ? "#fef3c7"
                              : "#fee2e2",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    ● {activeGrant.status === "Pending" ? "Chưa cấp quyền" : activeGrant.status === "Active" ? "Hoạt động" : activeGrant.status === "Paused" ? "Tạm dừng" : "Đã thu hồi"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  {activeGrant.bank ? (
                    <>
                      Ngân hàng: <strong style={{ color: "#0f172a" }}>{activeGrant.bank}</strong>
                      {activeGrant.accountNo ? (
                        <>
                          {" "}· Số TK: <code style={{ fontFamily: "monospace", color: "#0f172a" }}>{activeGrant.accountNo}</code>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <span>
                      Ngân hàng: <em style={{ color: "#94a3b8" }}>Chưa liên kết (Người dùng chưa hoàn tất cấp quyền)</em>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, background: "#f8fafc", borderRadius: 6, padding: "12px 14px" }}>
              <div>
                <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>GRANT ID</small>
                <code style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{activeGrant.grantId}</code>
              </div>
              <div>
                <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>SCOPES YÊU CẦU</small>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                  {activeGrant.scopes.map(s => (
                    <span key={s} style={{ fontSize: 11, background: "#e2e8f0", color: "#334155", padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>NGÀY TẠO</small>
                <span style={{ fontSize: 12, color: "#0f172a" }}>{activeGrant.createdAt}</span>
              </div>
              <div>
                <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>TRUY CẬP GẦN NHẤT</small>
                <span style={{ fontSize: 12, color: "#0f172a" }}>{activeGrant.lastAccess}</span>
              </div>
            </div>
          </div>

          {/* Call Logs Table */}
          <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Lịch sử gọi API ({activeGrant.logs.length} logs)
              </h3>
            </div>

            <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--line)" }}>
                    <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600, fontSize: 12 }}>Thời gian</th>
                    <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600, fontSize: 12 }}>Method & Endpoint</th>
                    <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600, fontSize: 12 }}>Status</th>
                    <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600, fontSize: 12 }}>Latency</th>
                    <th style={{ padding: "10px 12px", color: "#64748b", fontWeight: 600, fontSize: 12 }}>Request ID</th>
                  </tr>
                </thead>
                <tbody>
                  {activeGrant.logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "24px 12px", color: "#94a3b8" }}>
                        Chưa có lượt gọi API nào cho Grant ID này.
                      </td>
                    </tr>
                  ) : (
                    activeGrant.logs.map(log => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>
                          {log.timestamp}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: 12, color: "#0f172a", fontFamily: "monospace" }}>
                            {log.method} {log.endpoint}
                          </code>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: log.status === 200 ? "#16a34a" : "#dc2626", background: log.status === 200 ? "#dcfce7" : "#fee2e2", padding: "2px 6px", borderRadius: 4 }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 12 }}>
                          {log.latency}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
                          {log.requestId}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : searched ? (
        <div style={{ textAlign: "center", padding: "30px 20px", background: "white", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
            Không tìm thấy Grant ID: "{searchGrantId}"
          </h3>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
            Vui lòng kiểm tra lại mã Grant ID.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DataScreen({ data, showNotice }: { data: typeof screenData[string]; showNotice: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const rows = data.rows.filter(row => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  return <section className="panel data-screen"><div className="data-toolbar"><label className="compact-search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm…" /></label><select><option>Tất cả trạng thái</option><option>Active</option><option>Paused</option><option>Failed</option></select><button onClick={() => showNotice("Đã làm mới dữ liệu")}>↻ Làm mới</button></div><div className="generic-table-wrap"><table className="generic-table"><thead><tr>{data.columns.map(col => <th key={col}>{col}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} onClick={() => showNotice(`Đã mở ${row[0]}`)}>{row.map((cell, j) => <td key={j}>{j === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>)}</tbody></table></div><div className="data-footer"><span>{rows.length} kết quả</span><span>Dữ liệu cập nhật vừa xong</span></div></section>;
}

function StatusValue({ value }: { value: string }) {
  const kind = value.toLowerCase();
  return <span className={`grant-status ${kind}`}><i />{value === "Active" ? "Hoạt động" : value === "Paused" ? "Tạm dừng" : value === "Deleted" ? "Đã xoá" : value === "Success" ? "Thành công" : "Lỗi"}</span>;
}

function WebhookStatus({ value }: { value: string }) {
  return <span className={`webhook-status ${value.toLowerCase()}`}><i />{value === "Delivered" ? "Đã gửi" : value === "Retrying" ? "Đang thử lại" : value === "Failed" ? "Thất bại" : value}</span>;
}

function TeamSettingsScreen({
  teams,
  setTeams,
  selectedTeam,
  setSelectedTeam,
  selectedApp,
  setSelectedApp,
  members,
  setMembers,
  onNavigate,
  showNotice,
  initialTab = "overview",
}: {
  teams: TeamData[];
  setTeams: React.Dispatch<React.SetStateAction<TeamData[]>>;
  selectedTeam: TeamData;
  setSelectedTeam: (t: TeamData) => void;
  selectedApp: AppData;
  setSelectedApp: (a: AppData) => void;
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  onNavigate: (screen: string) => void;
  showNotice: (msg: string) => void;
  initialTab?: "overview" | "members" | "apps";
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "apps">(initialTab);
  const [openTeamMenuId, setOpenTeamMenuId] = useState<string | null>(null);
  const [openAppMenuId, setOpenAppMenuId] = useState<string | null>(null);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);

  function handleLeaveTeam(teamId: string, teamName: string) {
    setOpenTeamMenuId(null);
    showNotice(`Đã rời khỏi team "${teamName}"`);
  }

  function handleDeleteTeam(teamId: string, teamName: string) {
    setOpenTeamMenuId(null);
    if (teams.length <= 1) {
      showNotice("Không thể xoá team duy nhất của bạn");
      return;
    }
    setTeams(prev => prev.filter(t => t.id !== teamId));
    if (selectedTeam.id === teamId) {
      const remaining = teams.filter(t => t.id !== teamId);
      setSelectedTeam(remaining[0]);
      setSelectedApp(remaining[0].apps[0]);
    }
    showNotice(`✓ Đã xoá team "${teamName}"`);
  }

  function handleDeleteApp(appId: string, appName: string) {
    setOpenAppMenuId(null);
    if (selectedTeam.apps.length <= 1) {
      showNotice("Mỗi team phải có ít nhất 1 ứng dụng");
      return;
    }
    setTeams(prev => prev.map(t => {
      if (t.id === selectedTeam.id) {
        return { ...t, apps: t.apps.filter(a => a.id !== appId) };
      }
      return t;
    }));
    if (selectedApp.id === appId) {
      const remainingApps = selectedTeam.apps.filter(a => a.id !== appId);
      setSelectedApp(remainingApps[0]);
    }
    showNotice(`✓ Đã xoá ứng dụng "${appName}"`);
  }

  const otherTeams = teams.filter(t => t.id !== selectedTeam.id);
  const otherApps = selectedTeam.apps.filter(a => a.id !== selectedApp.id);

  return (
    <div style={{ maxWidth: 960, padding: "8px 0 40px" }} onClick={() => { setOpenTeamMenuId(null); setOpenAppMenuId(null); setOpenMemberMenuId(null); }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#000" }}>Team của tôi</h1>
        <button
          onClick={() => onNavigate("Tạo một team mới")}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            color: "#000",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: 0,
          }}
        >
          Tạo một team mới
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid #e2e8f0", marginBottom: 28 }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 0 12px",
            fontSize: 13,
            fontWeight: 700,
            color: activeTab === "overview" ? "#000" : "#64748b",
            borderBottom: activeTab === "overview" ? "2px solid #000" : "2px solid transparent",
            cursor: "pointer",
            letterSpacing: "0.5px",
          }}
        >
          TỔNG QUAN
        </button>
        <button
          onClick={() => setActiveTab("members")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 0 12px",
            fontSize: 13,
            fontWeight: 700,
            color: activeTab === "members" ? "#000" : "#64748b",
            borderBottom: activeTab === "members" ? "2px solid #000" : "2px solid transparent",
            cursor: "pointer",
            letterSpacing: "0.5px",
          }}
        >
          THÀNH VIÊN
        </button>
        <button
          onClick={() => setActiveTab("apps")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 0 12px",
            fontSize: 13,
            fontWeight: 700,
            color: activeTab === "apps" ? "#000" : "#64748b",
            borderBottom: activeTab === "apps" ? "2px solid #000" : "2px solid transparent",
            cursor: "pointer",
            letterSpacing: "0.5px",
          }}
        >
          DANH SÁCH ỨNG DỤNG
        </button>
      </div>

      {/* Tab Content: TỔNG QUAN */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Current Team */}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#000", marginBottom: 12 }}>Team hiện tại</div>
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: "#4f46e5",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {selectedTeam.short || selectedTeam.name.substring(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{selectedTeam.name}</strong>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{selectedTeam.apps.length} ứng dụng · Vai trò: {selectedTeam.role}</span>
                </div>
              </div>

              {/* Action dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setOpenTeamMenuId(openTeamMenuId === selectedTeam.id ? null : selectedTeam.id);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#64748b",
                    padding: "4px 8px",
                    borderRadius: 4,
                  }}
                >
                  •••
                </button>
                {openTeamMenuId === selectedTeam.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 4px)",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      width: 160,
                      zIndex: 30,
                      padding: "4px 0",
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleLeaveTeam(selectedTeam.id, selectedTeam.name)}
                      style={{
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: 13,
                        color: "#334155",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      🚪 Rời khỏi team
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(selectedTeam.id, selectedTeam.name)}
                      style={{
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: 13,
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      🗑 Xoá team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Other Teams */}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#000", marginBottom: 12 }}>Các team khác</div>
            {otherTeams.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", background: "white", border: "1px dashed #cbd5e1", borderRadius: 8, color: "#64748b", fontSize: 13 }}>
                Bạn chưa có team phụ nào khác. Nhấn <strong>Tạo một team mới</strong> ở trên để tạo thêm.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {otherTeams.map(team => (
                  <div
                    key={team.id}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: "#db2777",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {team.short || team.name.substring(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{team.name}</strong>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{team.apps.length} ứng dụng · Vai trò: {team.role}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setSelectedApp(team.apps[0]);
                          showNotice(`✓ Đã chuyển sang team: ${team.name}`);
                        }}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#0f172a",
                          cursor: "pointer",
                        }}
                      >
                        Chuyển team
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenTeamMenuId(openTeamMenuId === team.id ? null : team.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 18,
                          color: "#64748b",
                          padding: "4px 8px",
                          borderRadius: 4,
                        }}
                      >
                        •••
                      </button>
                      {openTeamMenuId === team.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            width: 160,
                            zIndex: 30,
                            padding: "4px 0",
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleLeaveTeam(team.id, team.name)}
                            style={{
                              width: "100%",
                              padding: "8px 14px",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              fontSize: 13,
                              color: "#334155",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            🚪 Rời khỏi team
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            style={{
                              width: "100%",
                              padding: "8px 14px",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              fontSize: 13,
                              color: "#dc2626",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            🗑 Xoá team
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: THÀNH VIÊN */}
      {activeTab === "members" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <strong style={{ fontSize: 15, color: "#0f172a", display: "block" }}>Danh sách thành viên</strong>
              <span style={{ fontSize: 13, color: "#64748b" }}>Quản lý các thành viên và phân quyền trong team</span>
            </div>
            <button
              onClick={() => onNavigate("Mời thành viên mới")}
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Mời thành viên
            </button>
          </div>

          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 600, fontSize: 12.5 }}>Tên</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 600, fontSize: 12.5 }}>Email</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 600, fontSize: 12.5 }}>Trạng thái</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 600, fontSize: 12.5 }}>Số điện thoại</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 600, fontSize: 12.5 }}>Vị trí</th>
                  <th style={{ padding: "14px 18px", color: "#64748b", fontWeight: 600, fontSize: 12.5, textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#0f172a" }}>{member.name}</td>
                    <td style={{ padding: "14px 18px", color: "#334155" }}>{member.email}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: member.status === "ACTIVE" ? "#16a34a" : "#d97706", letterSpacing: "0.5px" }}>
                        {member.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>{member.phone}</td>
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#0f172a" }}>{member.role}</td>
                    <td style={{ padding: "14px 18px", textAlign: "right", position: "relative" }}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenMemberMenuId(openMemberMenuId === member.id ? null : member.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          fontSize: 16,
                          padding: "2px 6px",
                        }}
                      >
                        ⋮
                      </button>
                      {openMemberMenuId === member.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 18,
                            top: "calc(100% - 6px)",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                            width: 140,
                            zIndex: 30,
                            padding: "4px 0",
                            textAlign: "left",
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setOpenMemberMenuId(null);
                              showNotice(`Đã đổi vai trò cho ${member.name}`);
                            }}
                            style={{ width: "100%", padding: "7px 12px", border: "none", background: "none", fontSize: 12.5, textAlign: "left", cursor: "pointer", color: "#334155" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            ✎ Đổi vai trò
                          </button>
                          <button
                            onClick={() => {
                              setOpenMemberMenuId(null);
                              if (member.role === "OWNER") {
                                showNotice("Không thể xoá Owner của team");
                                return;
                              }
                              setMembers(prev => prev.filter(m => m.id !== member.id));
                              showNotice(`Đã xoá ${member.name} khỏi team`);
                            }}
                            style={{ width: "100%", padding: "7px 12px", border: "none", background: "none", fontSize: 12.5, textAlign: "left", cursor: "pointer", color: "#dc2626" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            🗑 Xoá thành viên
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: DANH SÁCH ỨNG DỤNG */}
      {activeTab === "apps" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Current App */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#000" }}>Ứng dụng hiện tại</span>
              <button
                onClick={() => onNavigate("Tạo ứng dụng mới")}
                style={{
                  background: "white",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                }}
              >
                Tạo ứng dụng mới
              </button>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: selectedApp.color || "#6956d9",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {selectedApp.short}
                </span>
                <div>
                  <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{selectedApp.name}</strong>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Môi trường: <span style={{ fontWeight: 600, color: selectedApp.environment === "Production" ? "#16a34a" : "#d97706" }}>{selectedApp.environment}</span> · ID: {selectedApp.id}
                  </span>
                </div>
              </div>

              {/* Action dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setOpenAppMenuId(openAppMenuId === selectedApp.id ? null : selectedApp.id);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#64748b",
                    padding: "4px 8px",
                    borderRadius: 4,
                  }}
                >
                  •••
                </button>
                {openAppMenuId === selectedApp.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 4px)",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      width: 140,
                      zIndex: 30,
                      padding: "4px 0",
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleDeleteApp(selectedApp.id, selectedApp.name)}
                      style={{
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: 13,
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      🗑 Xoá app
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Other Apps */}
          {otherApps.length > 0 && (
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#000", marginBottom: 12 }}>Các ứng dụng khác của team</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {otherApps.map(app => (
                  <div
                    key={app.id}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: app.color || "#64748b",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {app.short}
                      </span>
                      <div>
                        <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{app.name}</strong>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Môi trường: <span style={{ fontWeight: 600, color: app.environment === "Production" ? "#16a34a" : "#d97706" }}>{app.environment}</span> · ID: {app.id}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          showNotice(`✓ Đã chọn ứng dụng: ${app.name}`);
                        }}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#0f172a",
                          cursor: "pointer",
                        }}
                      >
                        Chuyển app
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenAppMenuId(openAppMenuId === app.id ? null : app.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 18,
                          color: "#64748b",
                          padding: "4px 8px",
                          borderRadius: 4,
                        }}
                      >
                        •••
                      </button>
                      {openAppMenuId === app.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            width: 140,
                            zIndex: 30,
                            padding: "4px 0",
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleDeleteApp(app.id, app.name)}
                            style={{
                              width: "100%",
                              padding: "8px 14px",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              fontSize: 13,
                              color: "#dc2626",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            🗑 Xoá app
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InviteMemberScreen({
  selectedTeam,
  onInviteMember,
  onCancel,
  showNotice,
}: {
  selectedTeam: TeamData;
  onInviteMember: (member: TeamMember) => void;
  onCancel: () => void;
  showNotice: (msg: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("Thành viên");
  const [permissions, setPermissions] = useState<PermissionKey[]>(roleDefaultPermissions["Thành viên"]);

  function handleRoleChange(newRole: string) {
    setRole(newRole);
    if (roleDefaultPermissions[newRole]) {
      setPermissions(roleDefaultPermissions[newRole]);
    }
  }

  function togglePermission(key: PermissionKey) {
    setPermissions(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      const matched = Object.entries(roleDefaultPermissions).find(([_, list]) =>
        list.length === next.length && list.every(k => next.includes(k))
      );
      if (matched) {
        setRole(matched[0]);
      } else {
        setRole("Tùy chỉnh");
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      showNotice("Vui lòng nhập địa chỉ email");
      return;
    }
    const derivedName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const mappedRole: TeamMember["role"] =
      role === "Quản trị viên" ? "ADMIN" : role === "Nhà phát triển" ? "DEVELOPER" : "MEMBER";

    const newM: TeamMember = {
      id: `m_${Date.now()}`,
      name: derivedName || "Thành viên mới",
      email: email.trim(),
      phone: "09" + Math.floor(10000000 + Math.random() * 90000000),
      status: "ACTIVE",
      role: mappedRole,
    };
    onInviteMember(newM);
  }

  const hasPerm = (k: PermissionKey) => permissions.includes(k);

  return (
    <div style={{ maxWidth: 840, padding: "10px 0 40px" }}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#64748b",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          padding: 0,
        }}
      >
        Quay lại
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px 0", color: "#000" }}>Mời thành viên mới</h1>
      <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, margin: "0 0 28px 0" }}>
        Nhập địa chỉ email của người được mời và vai trò của họ, và hệ thống sẽ tự động gửi thư mời họ tham gia vào team và đóng góp vào thành công của team bạn
      </p>

      <form onSubmit={handleSubmit}>
        {/* Top row: Email & Role */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 24 }}>
          {/* Email input */}
          <div>
            <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", height: 56, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500, marginBottom: 2 }}>Email *</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="Email của người được mời"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#0f172a",
                  padding: 0,
                  background: "transparent",
                }}
              />
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 6, paddingLeft: 2 }}>Email của người được mời</div>
          </div>

          {/* Role selector */}
          <div>
            <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", height: 56, boxSizing: "border-box", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500, marginBottom: 2 }}>Vai trò</label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#0f172a",
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <option value="Thành viên">Thành viên</option>
                <option value="Nhà phát triển">Nhà phát triển</option>
                <option value="Quản trị viên">Quản trị viên</option>
                <option value="Tùy chỉnh">Tùy chỉnh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 1: Quyền chung */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#000", marginBottom: 14 }}>Quyền chung</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Item 1 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasPerm("view_secret")}
                onChange={() => togglePermission("view_secret")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Xem khóa bí mật</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Cho phép xem khóa bí mật của ứng dụng</span>
            </label>

            {/* Item 2 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasPerm("manage_app")}
                onChange={() => togglePermission("manage_app")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Quản lý ứng dụng</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Cho phép chỉnh sửa thông tin và cấu hình của ứng dụng</span>
            </label>
          </div>
        </div>

        {/* Section 2: Quyền truy cập nhật ký (log) */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#000", marginBottom: 14 }}>Quyền truy cập nhật ký (log)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Item 1 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasPerm("view_request_log")}
                onChange={() => togglePermission("view_request_log")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Xem Request Log</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Cho phép truy cập chi tiết các bản ghi yêu cầu (Request Log)</span>
            </label>

            {/* Item 2 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasPerm("view_webhook_log")}
                onChange={() => togglePermission("view_webhook_log")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Xem Webhook Log</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Cho phép truy cập chi tiết các bản ghi webhook</span>
            </label>

            {/* Item 3 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasPerm("view_link_log")}
                onChange={() => togglePermission("view_link_log")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Xem Link Log</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Cho phép truy cập chi tiết các bản ghi liên kết (Link Log)</span>
            </label>
          </div>
        </div>

        {/* Section 3: Quyền API */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#000", marginBottom: 14 }}>Quyền API</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Item 1 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasPerm("manage_redirect_uri")}
                onChange={() => togglePermission("manage_redirect_uri")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Quản lý Redirect URI</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Toàn quyền thêm, sửa hoặc xóa Redirect URI</span>
            </label>

            {/* Item 2 */}
            <label style={{ display: "grid", gridTemplateColumns: "24px 220px 1fr", alignItems: "center", cursor: "pointer", paddingLeft: 18 }}>
              <input
                type="checkbox"
                checked={hasPerm("view_redirect_uri")}
                onChange={() => togglePermission("view_redirect_uri")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#0f172a" }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#000" }}>Xem Redirect URI</span>
              <span style={{ fontSize: 13.5, color: "#334155" }}>Chỉ được xem danh sách Redirect URI, không được chỉnh sửa</span>
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: "38px",
              padding: "0 18px",
              background: "#1e293b",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0f172a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1e293b")}
          >
            <span>Mời thành viên</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: "38px",
              padding: "0 16px",
              background: "white",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateTeamScreen({
  onCreateTeam,
  onCancel,
  showNotice,
}: {
  onCreateTeam: (name: string) => void;
  onCancel: () => void;
  showNotice: (msg: string) => void;
}) {
  const [teamName, setTeamName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) {
      showNotice("Vui lòng nhập tên team");
      return;
    }
    onCreateTeam(teamName.trim());
  }

  return (
    <div style={{ maxWidth: 640, padding: "10px 0 40px" }}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#64748b",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          padding: 0,
        }}
      >
        Quay lại
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px 0", color: "#000" }}>Tạo một team mới</h1>
      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "0 0 32px 0" }}>
        Một team mới sẽ có thể tạo và xây dựng những ứng dụng mới của team, giúp việc quản lý những ứng dụng trong một team trở nên dễ dàng hơn.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "14px 16px", marginBottom: 6 }}>
          <label style={{ fontSize: 12.5, color: "#64748b", display: "block", marginBottom: 4 }}>Tên *</label>
          <input
            type="text"
            required
            autoFocus
            placeholder="Nhập tên team..."
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 15,
              fontWeight: 500,
              color: "#0f172a",
              padding: 0,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 28 }}>
          Tên của team. Ví dụ: Team 1, PayOS, Team anh Hưng, ...
        </div>

        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, marginBottom: 18 }}>
          Bằng cách lựa chọn nút "Tạo team", bạn đã đồng ý với Cas <strong>Điều khoản sử dụng</strong> và <strong>Tuyên bố về quyền riêng tư</strong>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            height: "46px",
            background: "#4b5563",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#374151")}
          onMouseLeave={e => (e.currentTarget.style.background = "#4b5563")}
        >
          <span>Tạo team</span>
        </button>
      </form>
    </div>
  );
}

function CreateAppScreen({
  currentTeam,
  onCreateApp,
  onCancel,
  showNotice,
}: {
  currentTeam: TeamData;
  onCreateApp: (app: { name: string; description: string; website: string; logo?: string }) => void;
  onCancel: () => void;
  showNotice: (msg: string) => void;
}) {
  const [appName, setAppName] = useState("");
  const [appDesc, setAppDesc] = useState("");
  const [appWebsite, setAppWebsite] = useState("");
  const [appLogoUploaded, setAppLogoUploaded] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appName.trim()) {
      showNotice("Vui lòng nhập tên ứng dụng");
      return;
    }
    onCreateApp({
      name: appName.trim(),
      description: appDesc.trim(),
      website: appWebsite.trim(),
      logo: appLogoUploaded ? "uploaded" : undefined,
    });
  }

  return (
    <div style={{ maxWidth: 640, padding: "10px 0 40px" }}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#64748b",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          padding: 0,
        }}
      >
        Quay lại
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px 0", color: "#000" }}>Tạo ứng dụng mới</h1>
      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "0 0 32px 0" }}>
        Một ứng dụng mới sẽ có một cặp client, secret key để các team có thể ứng dụng tích hợp các tính năng
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Tên ứng dụng */}
        <div>
          <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "14px 16px", marginBottom: 6 }}>
            <label style={{ fontSize: 12.5, color: "#64748b", display: "block", marginBottom: 4 }}>Tên ứng dụng *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ví dụ: Cas, PayOS, CASSO..."
              value={appName}
              onChange={e => setAppName(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 15,
                fontWeight: 500,
                color: "#0f172a",
                padding: 0,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Tên của app. Ví dụ: Cas, PayOS, CASSO, ...</div>
        </div>

        {/* Mô tả */}
        <div>
          <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "14px 16px", marginBottom: 6 }}>
            <label style={{ fontSize: 12.5, color: "#64748b", display: "block", marginBottom: 4 }}>Mô tả *</label>
            <input
              type="text"
              required
              placeholder="Mô tả đơn giản về ứng dụng"
              value={appDesc}
              onChange={e => setAppDesc(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 15,
                fontWeight: 500,
                color: "#0f172a",
                padding: 0,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Mô tả đơn giản về ứng dụng</div>
        </div>

        {/* Trang web liên quan */}
        <div>
          <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "14px 16px", marginBottom: 6 }}>
            <label style={{ fontSize: 12.5, color: "#64748b", display: "block", marginBottom: 4 }}>Trang web liên quan *</label>
            <input
              type="text"
              required
              placeholder="https://example.com"
              value={appWebsite}
              onChange={e => setAppWebsite(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 15,
                fontWeight: 500,
                color: "#0f172a",
                padding: 0,
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Website liên quan đến ứng dụng</div>
        </div>

        {/* Logo */}
        <div>
          <div style={{ background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "16px", marginBottom: 6 }}>
            <label style={{ fontSize: 12.5, color: "#64748b", display: "block", marginBottom: 12 }}>Logo</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
              <label
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "10px 0",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#0f172a",
                  background: appLogoUploaded ? "#f0fdf4" : "white",
                  display: "block",
                }}
              >
                {appLogoUploaded ? "✓ Đã tải logo lên" : "Cập nhật"}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  style={{ display: "none" }}
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAppLogoUploaded(true);
                      showNotice("✓ Đã chọn file logo");
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Hình ảnh phải có kích thước nhỏ hơn 1MB và file .jpg, .jpeg, .png</div>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            height: "46px",
            background: "#4b5563",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            marginTop: 8,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#374151")}
          onMouseLeave={e => (e.currentTarget.style.background = "#4b5563")}
        >
          <span>Tạo ứng dụng</span>
        </button>
      </form>
    </div>
  );
}
