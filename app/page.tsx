"use client";

import { useMemo, useState, type CSSProperties } from "react";

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
      { id: "app_8F2KD91M", name: "BankHub EKYC", short: "BE", color: "#6956d9", environment: "Production" },
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
  { label: "DEVELOPER", items: [{ icon: "⌁", label: "API keys" }, { icon: "↗", label: "Direct URL" }, { icon: "◫", label: "Webhooks" }, { icon: "≡", label: "Logs" }, { icon: "📖", label: "Userguide" }] },
  { label: "HOẠT ĐỘNG", items: [{ icon: "◎", label: "Grants" }, { icon: "↗", label: "Usage" }, { icon: "💳", label: "Billing" }, { icon: "◇", label: "Grant debugger" }] },
  { label: "CẤU HÌNH", items: [{ icon: "⚙", label: "Cài đặt App" }, { icon: "♙", label: "Thành viên" }] },
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
  QRPay: { grants: "986", costGrants: "750.000 VNĐ", active: "954", calls: "146.700", cost: "14.280.000", endpoints: ["/v2/qr/create", "/v2/qr/{id}", "/v2/qr/status"], price: 40, webhook: true },
  VirtualAccount: { grants: "742", costGrants: "750.000 VNĐ", active: "716", calls: "98.400", cost: "1.520.000", endpoints: ["/v2/virtual-accounts", "/v2/virtual-accounts/{id}", "/v2/virtual-accounts/transactions"], price: 50, webhook: true },
  BalanceHook: { grants: "2.204", costGrants: "750.000 VNĐ", active: "2.171", calls: "281.400", cost: "84.270.000", endpoints: ["/v2/balance/webhook", "/v2/balance/events"], price: 35, webhook: true },
  Transfer: { grants: "1.126", costGrants: "750.000 VNĐ", active: "1.084", calls: "108.200", cost: "215.600.000", endpoints: ["/v2/transfers", "/v2/transfers/{id}", "/v2/transfers/confirm"], price: 80 },
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
      { label: "Tổng Grant ID", value: "2.847", unit: "grant" },
      { label: "Đang hoạt động · đến 31/07", value: "2.592", unit: "grant" },
      { label: "Thêm mới trong tháng", value: "184", unit: "grant" },
      { label: "Tạm dừng trong tháng", value: "14", tone: "warning", unit: "grant" },
      { label: "Đã xoá trong tháng", value: "3", tone: "danger", unit: "grant" },
    ],
    rows: baseRows,
  },
  ...Object.fromEntries((Object.keys(scopeConfig) as Exclude<AnalyticsTab, "Connection">[]).map(scope => {
    const config = scopeConfig[scope];
    return [scope, {
      subtitle: `${config.grants} Grant ID đang có quyền gọi API thuộc scope ${scope}`,
      metrics: scope === "QRPay"
        ? [
          { label: "Grant đang hoạt động", value: config.active, change: "+6.8%", unit: "grant" },
          { label: "Thanh toán thành công", value: "132.400", change: "+8.6%", unit: "giao dịch" },
          { label: "Thông báo thành công", value: "131.900", change: "+8.2%", unit: "giao dịch" },
          { label: "Tổng tiền giao dịch", value: "12.486.750.000", change: "+10.4%", unit: "đ" },
          { label: "Chi phí QR Pay", value: config.cost, change: "+8.9%", unit: "đ" },
        ]
        : scope === "VirtualAccount"
          ? [
            { label: "Grant đang hoạt động", value: config.active, change: "+6.8%", unit: "grant" },
            { label: "Số lượng VA đang hoạt động", value: "1.520", change: "+12.4%", unit: "VA" },
            { label: "Số lượng VA tạo mới", value: "184", change: "+15.2%", unit: "VA" },
            { label: "Số lượng VA ngừng kích hoạt", value: "12", tone: "warning", change: "+2.1%", unit: "VA" },
            { label: "Chi phí VA", value: config.cost, change: "+8.9%", unit: "đ" },
          ]
          : scope === "BalanceHook"
            ? [
              { label: "Tổng giao dịch", value: "281.400", change: "+9.7%", unit: "giao dịch" },
              { label: "Thông báo thành công", value: "280.900", change: "+9.5%", unit: "thông báo" },
              { label: "Thông báo thất bại", value: "500", tone: "warning", change: "-1.2%", unit: "thông báo" },
              { label: "Tổng tiền giao dịch", value: "45.820.000.000", change: "+14.2%", unit: "đ" },
              { label: "Chi phí", value: config.cost, change: "+8.9%", unit: "đ" },
            ]
            : scope === "Transfer"
              ? [
                { label: "Tổng giao dịch", value: "108.200", change: "+9.7%", unit: "giao dịch" },
                { label: "Giao dịch thành công", value: "107.800", change: "+9.6%", unit: "giao dịch" },
                { label: "Giao dịch thất bại", value: "400", tone: "warning", change: "-1.5%", unit: "giao dịch" },
                { label: "Tổng tiền", value: "82.650.000.000", change: "+16.8%", unit: "đ" },
                { label: "Chi phí", value: config.cost, change: "+8.9%", unit: "đ" },
              ]
              : scope === "Transaction"
                ? [
                  { label: "Grant đang hoạt động", value: "62", change: "+4.2%", unit: "grant" },
                  { label: "Chi phí Grant (100.000đ/grant)", value: "6.200.000", change: "+4.2%", unit: "đ" },
                  { label: "API calls thành công", value: config.calls, change: "+9.7%", unit: "calls" },
                  { label: "Chi phí API (30.000đ/1.000 calls)", value: "12.804.000", change: "+9.7%", unit: "đ" },
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
      { label: "Tổng Deeplink", value: "115.400", change: "+14.2%", unit: "lượt" },
      { label: "Tổng tiền giao dịch", value: "48.250.000.000 VNĐ", change: "+18.5%" },
      { label: "Chi phí", value: "11.540.000 VNĐ", change: "+12.1%" },
      { label: "Deeplink thành công", value: "112.800", change: "+15.0%", unit: "lượt" },
      { label: "Deeplink thất bại", value: "2.600", change: "-2.1%", tone: "danger", unit: "lượt" },
    ],
    rows: buildScopeRows("Deeplink"),
  },
};

const screenData: Record<string, { description: string; action: string; columns: string[]; rows: string[][] }> = {
  "API keys": { description: "Client ID và Secret key dùng để xác thực App.", action: "Tìm hiểu thêm ↗", columns: [], rows: [] },
  API: { description: "Danh sách URL nhận kết quả sau khi end-user cấp quyền thành công.", action: "Tìm hiểu thêm ↗", columns: [], rows: [] },
  Webhooks: { description: "Endpoint nhận sự kiện Grant, Transaction, QRPay và VirtualAccount.", action: "＋ Thêm webhook", columns: [], rows: [] },
  Logs: { description: "Lịch sử request API và webhook của App.", action: "⇩ Export logs", columns: ["Request ID", "Endpoint / Event", "Scope", "Grant ID", "HTTP"], rows: [["req_7KQ2M91P", "/v2/transactions", "Transaction", "grt_8L2KP91N", "200"], ["req_4PX9D20A", "/v2/balance", "Balance", "grt_4T7MD20Q", "200"], ["wh_1MV3C84F", "payment.succeeded", "QRPay webhook", "grt_1A9HC63V", "200"], ["wh_8AB5R72W", "va.credited", "VirtualAccount webhook", "grt_6P3RF82K", "429"]] },
  Grants: { description: "Tổng hợp Grant ID, ngân hàng và các scope đã được cấp.", action: "＋ Tạo connection", columns: ["Grant ID", "End-user", "Ngân hàng", "Scopes được cấp", "Trạng thái"], rows: baseRows.map(r => [r.grant, r.user, r.bank, r.scopes, r.status]) },
  Usage: { description: "Theo dõi Grant, API usage và chi phí theo từng nghiệp vụ.", action: "⇩ Tải hoá đơn", columns: ["Scope", "Grant có quyền", "API calls", "Chi phí", "Trạng thái"], rows: (Object.keys(scopeConfig) as Exclude<AnalyticsTab, "Connection">[]).map(scope => [scope, scopeConfig[scope].grants, scopeConfig[scope].calls, scopeConfig[scope].cost, "Active"]) },
  "Grant debugger": { description: "Kiểm tra trạng thái và quyền của một Grant.", action: "Chạy kiểm tra", columns: ["Grant ID gần đây", "Ngân hàng", "Scopes", "Hết hạn", "Trạng thái"], rows: [["grt_8L2KP91N", "Techcombank", "identity, balance, transaction", "24/10/2026", "Healthy"], ["grt_4T7MD20Q", "Vietcombank", "balance, transaction", "02/11/2026", "Healthy"], ["grt_1A9HC63V", "MB Bank", "identity, qrpay", "28/07/2026", "Expiring"]] },
  "Cài đặt App": { description: "Thông tin và callback URL của App.", action: "Lưu thay đổi", columns: ["Cấu hình", "Giá trị", "Môi trường", "Cập nhật", "Trạng thái"], rows: [["App ID", "app_8F2KD91M", "—", "Không đổi", "Active"], ["Redirect URI", "bankhub.vn/cas/callback", "Production", "19/07/2026", "Verified"], ["Allowed origin", "https://bankhub.vn", "Production", "19/07/2026", "Verified"]] },
  "Thành viên": { description: "Quản lý quyền truy cập App.", action: "＋ Mời thành viên", columns: ["Thành viên", "Email", "Vai trò", "Truy cập gần nhất", "Trạng thái"], rows: [["Minh Nguyễn", "minh@vietfin.vn", "Owner", "Vừa xong", "Active"], ["Linh Phạm", "linh@vietfin.vn", "Developer", "2 giờ trước", "Active"], ["Huy Trần", "huy@vietfin.vn", "Analyst", "Hôm qua", "Active"]] },
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
    title: "Lịch sử đồng bộ giao dịch",
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
    title: "Danh sách giao dịch",
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
    title: "Danh sách tài khoản định danh (Virtual Account)",
    columns: ["STT", "GrantID", "Ngân hàng", "Tên tài khoản", "STK gốc", "Tên VA", "VA", "Trạng thái", "Ngày tạo"],
    rows: [
      ["1", "grt_6P3RF82K", "ACB", "CTY TNHH NAM VIET", "2167 •••• 3306", "VA Thanh toan Nam Viet", "9868120001842", "Active", "23/07/2026 17:03"],
      ["2", "grt_9Q4LC73A", "Vietcombank", "CTY CP NOVA RETAIL", "1028 •••• 1098", "VA Nova Store HCM", "9704360028471", "Active", "22/07/2026 09:34"],
      ["3", "grt_4T7MD20Q", "Techcombank", "CTY CP MINH LONG", "1903 •••• 4812", "VA Thu ho Minh Long", "1903690015820", "Paused", "20/07/2026 14:15"],
      ["4", "grt_8L2KP91N", "BIDV", "NGUYEN MINH ANH", "2111 •••• 9024", "VA Minh Anh Personal", "1289100042763", "Inactive", "18/07/2026 11:20"],
      ["5", "grt_1A9HC63V", "MB Bank", "PHAM THUY LINH", "0681 •••• 6721", "VA Linh Pham Store", "9901820038194", "Active", "15/07/2026 08:45"],
      ["6", "grt_2K8NP14D", "Sacombank", "TRAN HOANG LONG", "0602 •••• 2180", "VA Long Tran Online", "9602410082736", "Active", "12/07/2026 16:30"],
      ["7", "grt_5M3KP82N", "VietinBank", "NGUYEN VAN DUC", "1018 •••• 5541", "VA Van Duc Trading", "9688100055410", "Active", "10/07/2026 14:10"],
      ["8", "grt_7B9RT14H", "Techcombank", "CTY CP TRUONG SON", "1902 •••• 8812", "VA Thu ho Truong Son", "1903880088120", "Active", "08/07/2026 09:25"],
      ["9", "grt_3C8VL90P", "VPBank", "TRINH BAO NGOC", "1542 •••• 9901", "VA Ngoc Trinh Shop", "9842150099015", "Paused", "05/07/2026 16:40"],
      ["10", "grt_9X2NY55T", "Vietcombank", "CTY TNHH SAI GON TECH", "1019 •••• 3342", "VA Saigon Tech Main", "9704190033421", "Active", "03/07/2026 11:15"],
      ["11", "grt_1L8QP42K", "TPBank", "VU THU TRANG", "0219 •••• 4410", "VA Thu Trang Fashion", "9219000044102", "Active", "01/07/2026 15:50"],
      ["12", "grt_6K4FD19M", "BIDV", "CTY CP HOANG GIA", "2151 •••• 6678", "VA Hoang Gia B2B", "1289210066789", "Active", "28/06/2026 10:05"],
      ["13", "grt_8P9WX33L", "Techcombank", "BUI MY LINH", "1903 •••• 1129", "VA My Linh Studio", "1903110011299", "Active", "25/06/2026 17:35"],
      ["14", "grt_2M7VT88D", "MB Bank", "CTY TNHH A CHAU", "0682 •••• 9988", "VA A Chau Logistics", "9901060099884", "Active", "22/06/2026 08:50"],
      ["15", "grt_4H9BN11Q", "Sacombank", "LY KIM NGAN", "0603 •••• 7712", "VA Kim Ngan Jewelry", "9602060077123", "Active", "20/06/2026 13:15"],
    ],
  },
  BalanceHook: {
    title: "Lịch sử thông báo biến động số dư (Balance Hook)",
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
    title: "Lịch sử lệnh chuyển tiền (Transfer)",
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
    title: "Danh sách hoá đơn",
    columns: ["Invoice ID", "Grant ID", "Người mua", "MST", "Giá trị", "Ngày hoá đơn", "Trạng thái", "Cập nhật"],
    rows: [
      ["inv_2026_1842", "grt_4T7MD20Q", "Công ty CP Minh Long", "0317849201", "₫24,860,000", "24/07/2026", "Issued", "24/07 · 16:17"],
      ["inv_2026_1841", "grt_9Q4LC73A", "Công ty CP Nova Retail", "0318291740", "₫8,450,000", "24/07/2026", "Paid", "24/07 · 15:46"],
      ["inv_2026_1840", "grt_6P3RF82K", "Công ty TNHH Nam Việt", "0109384612", "₫62,000,000", "23/07/2026", "Issued", "24/07 · 14:58"],
      ["inv_2026_1839", "grt_8L2KP91N", "Nguyễn Minh Anh", "—", "₫1,250,000", "23/07/2026", "Cancelled", "24/07 · 13:20"],
    ],
  },
  Deeplink: {
    title: "Danh sách giao dịch Deeplink",
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
    Transaction: { title: "Xu hướng giao dịch Transaction", primary: "GD thành công", secondary: "GD thất bại", unit: "giao dịch" },
    QRPay: { title: "Xu hướng thanh toán QR Pay", primary: "Thành công", secondary: "Hủy / Hết hạn", unit: "giao dịch" },
    VirtualAccount: { title: "Xu hướng tạo Virtual Account", primary: "Tạo mới", secondary: "Xóa", unit: "giao dịch" },
    BalanceHook: { title: "Xu hướng thông báo Balance Hook", primary: "Webhook thành công", secondary: "Lỗi / Retry", unit: "thông báo" },
    Transfer: { title: "Xu hướng chuyển tiền Transfer", primary: "Chuyển tiền thành công", secondary: "Thất bại", unit: "giao dịch" },
    Deeplink: { title: "Xu hướng tạo Deeplink", primary: "Deeplink thành công", secondary: "Thất bại", unit: "lượt" },
    Identity: { title: "Xu hướng gọi API Identity", primary: "Thành công", secondary: "Lỗi", unit: "calls" },
    Balance: { title: "Xu hướng tra cứu Balance", primary: "Thành công", secondary: "Lỗi", unit: "calls" },
    eKYC: { title: "Xu hướng xác thực eKYC", primary: "Thành công", secondary: "Lỗi", unit: "lượt" },
    Invoice: { title: "Xu hướng xuất Invoice", primary: "Hợp lệ", secondary: "Hủy", unit: "hóa đơn" },
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
                {metric.change && <small className={metric.tone}>↗ {metric.change}</small>}
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
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedApp, setSelectedApp] = useState(teams[0].apps[0]);
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
  const [sidebarWidth, setSidebarWidth] = useState(286);
  const [resizingSidebar, setResizingSidebar] = useState(false);

  // Active enabled scopes for the current onboarded app
  const [enabledScopes, setEnabledScopes] = useState<AnalyticsTab[]>([
    "Transaction", "QRPay", "Deeplink"
  ]);

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
          // columns: ["STT", "Mã VA", "Grant ID", "Ngân hàng", "Tên tài khoản", "Số tài khoản VA", "Tổng tiền thu", "Trạng thái", "Thời gian tạo"]
          newRow = [
            nextStt,
            `va_${reqId.slice(4)}`,
            "grt_8L2KP91N",
            bankName,
            userName,
            `99021${Math.floor(100000 + Math.random() * 900000)}`,
            amountFormatted,
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
  const isDeveloperPage = activeNav === "API keys" || activeNav === "Direct URL" || activeNav === "Webhooks";

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
    <div className={`console-shell ${resizingSidebar ? "resizing-sidebar" : ""}`} style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand-row" style={{ position: "relative", cursor: "pointer", paddingRight: 8 }} onClick={() => setAppMenuOpen(!appMenuOpen)}>
          <a className="brand" href="#" onClick={e => e.preventDefault()} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span className="brand-mark"><i /><i /><i /></span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong>{selectedApp.name}</strong>
            </span>
            <span className="switcher-chevrons" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", lineHeight: 1 }}>⌃<br />⌄</span>
          </a>
          <button className="sidebar-collapse" onClick={(e) => { e.stopPropagation(); setMobileMenu(false); }}>«</button>
          {appMenuOpen && <div className="app-menu" style={{ top: "100%", left: 10, width: "calc(100% - 20px)", zIndex: 10 }} onClick={e => e.stopPropagation()}><div className="app-menu-heading"><span>Apps của {selectedTeam.name}</span><button>＋ Tạo App</button></div>{selectedTeam.apps.map(app => <button className={app.id === selectedApp.id ? "selected" : ""} key={app.id} onClick={() => { setSelectedApp(app); setAppMenuOpen(false); }}><span className="app-avatar" style={{ background: app.color }}>{app.short}</span><span><strong>{app.name}</strong><small>{app.environment} · {app.id}</small></span>{app.id === selectedApp.id && <b>✓</b>}</button>)}</div>}
        </div>
        <nav className="sidebar-nav">{navGroups.map((group, i) => <div className="nav-group" key={i}>{group.label && <p>{group.label}</p>}{group.items.map(item => <div className="nav-item-wrap" key={item.label}>
          <button className={activeNav === item.label ? "active" : ""} onClick={() => { if (item.label === "Usage") { if (activeNav === "Usage") setUsageExpanded(!usageExpanded); else { setActiveNav("Usage"); setUsageExpanded(true); } } else { setActiveNav(item.label); setMobileMenu(false); } }}><span>{item.icon}</span>{item.label}{item.label === "Usage" && <small className={`nav-arrow ${usageExpanded ? "open" : ""}`}>⌄</small>}</button>
          {item.label === "Usage" && usageExpanded && <div className="usage-subnav">
            {visibleUsageTabs.filter(tab => enabledScopes.includes(tab)).map(tab => <button className={activeNav === "Usage" && usageView === tab ? "active" : ""} key={tab} onClick={() => { setActiveNav("Usage"); setUsageView(tab); setAnalyticsTab(tab); setSearch(""); setGrantFilter("Tất cả Grant"); setStatusFilter("Tất cả trạng thái"); setPage(1); setMobileMenu(false); }}>{usageTabLabel(tab)}</button>)}
          </div>}
        </div>)}</div>)}
          <div className="nav-group utility-nav">
            <button onClick={() => { showNotice("Đã mở tài liệu Cas"); setMobileMenu(false); }}><span>▤</span>Tài liệu</button>
            <button onClick={() => { showNotice("Đã mở trung tâm hỗ trợ"); setMobileMenu(false); }}><span>◉</span>Hỗ trợ</button>
          </div>
        </nav>
        <div className="sidebar-footer" style={{ position: "relative" }}>
          {teamMenuOpen && <div className="app-menu" style={{ bottom: "100%", top: "auto", left: 10, width: "calc(100% - 20px)", marginBottom: 10, zIndex: 10 }}><div className="app-menu-heading"><span>Teams của bạn</span><button>＋ Tạo Team</button></div>{teams.map(team => <button className={team.id === selectedTeam.id ? "selected" : ""} key={team.id} onClick={() => { setSelectedTeam(team); setSelectedApp(team.apps[0]); setTeamMenuOpen(false); }}><span className="app-avatar" style={{ background: "#4a5568" }}>{team.short}</span><span><strong>{team.name}</strong><small>Vai trò: {team.role}</small></span>{team.id === selectedTeam.id && <b>✓</b>}</button>)}</div>}
          <div className="vendor-profile" style={{ cursor: "pointer" }} onClick={() => setTeamMenuOpen(!teamMenuOpen)}>
            <span className="profile-avatar">{selectedTeam.short}</span>
            <span><small>TEAM</small><strong>{selectedTeam.name}</strong></span>
            <button style={{ pointerEvents: "none" }}>•••</button>
          </div>
        </div>
        <div className="sidebar-resizer" role="separator" aria-label="Thay đổi chiều rộng menu" aria-orientation="vertical" onPointerDown={e => { setResizingSidebar(true); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (resizingSidebar) setSidebarWidth(Math.min(390, Math.max(220, e.clientX))); }} onPointerUp={e => { setResizingSidebar(false); e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => setResizingSidebar(false)} />
      </aside>

      <div className="workspace" onClick={() => { if (appMenuOpen) setAppMenuOpen(false); if (teamMenuOpen) setTeamMenuOpen(false); if (langMenuOpen) setLangMenuOpen(false); if (userMenuOpen) setUserMenuOpen(false); }}>
        <header className="topbar">
          <button className="mobile-trigger" onClick={() => setMobileMenu(true)}>☰</button>
          <div className="crumbs">
            <span>{selectedApp.name}</span>
            <b>/</b>
            <strong>{activeNav}</strong>
            {activeNav === "Usage" && <><b>/</b><strong>{usageView === "Connection" ? "Grant" : usageView === "VirtualAccount" ? "Virtual Account" : usageView === "BalanceHook" ? "Balance Hook" : usageView}</strong></>}
          </div>
          <div className="top-actions">
            <button className="status-pill" onClick={() => showNotice("Hệ thống Open Banking hoạt động bình thường ( uptime 99.99% )")}>
              <i />Hệ thống ổn định
            </button>
            <button className="icon-button" title="Tìm kiếm nhanh (Cmd+K)" onClick={(e) => { e.stopPropagation(); setSearchModalOpen(true); }}>⌕</button>

            {/* Language Selector Dropdown */}
            <div className="lang-selector-wrap" onClick={e => e.stopPropagation()}>
              <button className="language-selector-btn" onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}>
                <span>{currentLang.flag}</span>
                <span>{currentLang.code}</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>⌄</span>
              </button>
              {langMenuOpen && (
                <div className="lang-menu">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      className={lang.code === currentLang.code ? "selected" : ""}
                      onClick={() => {
                        setCurrentLang(lang);
                        setLangMenuOpen(false);
                        showNotice(`Đã chuyển ngôn ngữ sang ${lang.name}`);
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.code === currentLang.code && <span className="check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Avatar & Menu */}
            <div className="user-avatar-wrap" onClick={e => e.stopPropagation()}>
              <button className="user-avatar" style={{ border: 0, cursor: "pointer" }} onClick={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}>
                MN
              </button>
              {userMenuOpen && (
                <div className="user-menu-popover">
                  <div className="user-menu-header">
                    <span className="user-avatar" style={{ width: 34, height: 34 }}>MN</span>
                    <div>
                      <strong>Minh Nguyễn</strong>
                      <small>minh.nguyen@vietfin.vn</small>
                      <span className="badge">Super Admin</span>
                    </div>
                  </div>
                  <button onClick={() => { showNotice("Đã mở trang Hồ sơ cá nhân"); setUserMenuOpen(false); }}>👤 Hồ sơ cá nhân</button>
                  <button onClick={() => { showNotice("Đã mở Cài đặt bảo mật & 2FA"); setUserMenuOpen(false); }}>🔑 Cài đặt bảo mật & 2FA</button>
                  <button onClick={() => { showNotice("Đã mở Nhật ký truy cập"); setUserMenuOpen(false); }}>📜 Nhật ký hoạt động</button>
                  <div style={{ borderTop: "1px solid var(--line)", margin: "4px 0" }} />
                  <button style={{ color: "var(--red)" }} onClick={() => { showNotice("Mô phỏng đăng xuất thành công"); setUserMenuOpen(false); }}>🚪 Đăng xuất</button>
                </div>
              )}
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
            <UsageTotal onSelectTab={tab => { if (tab === "Connection") { setActiveNav("Grants"); setAnalyticsTab("Connection"); } else { setActiveNav("Usage"); setUsageExpanded(true); setUsageView(tab); setAnalyticsTab(tab); } setPage(1); }} showNotice={showNotice} />
          ) : activeNav === "Tổng quan" ? (
            <OnboardingScreen enabledScopes={enabledScopes} setEnabledScopes={setEnabledScopes} onNavigate={setActiveNav} showNotice={showNotice} />
          ) : activeNav === "Userguide" ? (
            <UserguideScreen enabledScopes={enabledScopes} showNotice={showNotice} onRunTest={runTestApiCall} />
          ) : activeNav === "Logs" ? (
            <LogsScreen logRecordsData={logRecordsState} showNotice={showNotice} />
          ) : isDeveloperPage ? (
            <DeveloperSettings page={activeNav as "API keys" | "Direct URL" | "Webhooks"} showNotice={showNotice} />
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
                  <span style={{ fontSize: 13, color: "var(--purple)", fontWeight: 600 }}>Di chuyển →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageTotal({ onSelectTab, showNotice }: { onSelectTab?: (tab: AnalyticsTab) => void; showNotice: (message: string) => void }) {
  const [paymentState, setPaymentState] = useState<"unpaid" | "scanning" | "paid">("unpaid");
  const [wantEinvoice, setWantEinvoice] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const historyCycles = [
    {
      cycle: "Tháng 06/2026",
      total: "₫330,420,000",
      subtotal: "₫300,381,818",
      vat: "₫30,038,182",
      status: "Đã thanh toán",
      date: "02/07/2026",
      invoice: true,
      items: [
        { name: "Grant Connection", quantity: "2.500", unit: "connections", price: "Miễn phí", cost: "₫0" },
        { name: "Transaction", quantity: "380.000", unit: "calls", price: "30.000đ/1.000 API calls", cost: "₫16.900.000" },
        { name: "QR Pay", quantity: "120.000", unit: "GD thành công", price: "50đ + 0.3% / GD", cost: "₫13.000.000" },
        { name: "Virtual Account", quantity: "1.400", unit: "VA hoạt động", price: "1.000đ / VA", cost: "₫1.400.000" },
        { name: "Balance Hook", quantity: "250.000", unit: "thông báo", price: "300đ / thông báo", cost: "₫75.000.000" },
        { name: "Transfer", quantity: "95.000", unit: "GD thành công", price: "2.000đ / GD", cost: "₫190,000,000" },
        { name: "Deeplink", quantity: "40.818", unit: "lượt", price: "100đ / lượt", cost: "₫4,081,818" },
      ]
    },
    {
      cycle: "Tháng 05/2026",
      total: "₫315,100,000",
      subtotal: "₫286,454,545",
      vat: "₫28,645,455",
      status: "Đã thanh toán",
      date: "04/06/2026",
      invoice: true,
      items: [
        { name: "Grant Connection", quantity: "2.100", unit: "connections", price: "Miễn phí", cost: "₫0" },
        { name: "Transaction", quantity: "350.000", unit: "calls", price: "30.000đ/1.000 API calls", cost: "₫15.500.000" },
        { name: "QR Pay", quantity: "110.000", unit: "GD thành công", price: "50đ + 0.3% / GD", cost: "₫11.500.000" },
        { name: "Virtual Account", quantity: "1.300", unit: "VA hoạt động", price: "1.000đ / VA", cost: "₫1.300.000" },
        { name: "Balance Hook", quantity: "240.000", unit: "thông báo", price: "300đ / thông báo", cost: "₫72.000.000" },
        { name: "Transfer", quantity: "91.000", unit: "GD thành công", price: "2.000đ / GD", cost: "₫182,000,000" },
        { name: "Deeplink", quantity: "41.545", unit: "lượt", price: "100đ / lượt", cost: "₫4,154,545" },
      ]
    },
    {
      cycle: "Tháng 04/2026",
      total: "₫290,000,000",
      subtotal: "₫263,636,364",
      vat: "₫26,363,636",
      status: "Đã thanh toán",
      date: "05/05/2026",
      invoice: false,
      items: [
        { name: "Grant Connection", quantity: "1.900", unit: "connections", price: "Miễn phí", cost: "₫0" },
        { name: "Transaction", quantity: "310.000", unit: "calls", price: "30.000đ/1.000 API calls", cost: "₫13.800.000" },
        { name: "QR Pay", quantity: "95.000", unit: "GD thành công", price: "50đ + 0.3% / GD", cost: "₫9.900.000" },
        { name: "Virtual Account", quantity: "1.100", unit: "VA hoạt động", price: "1.000đ / VA", cost: "₫1.100.000" },
        { name: "Balance Hook", quantity: "220.000", unit: "thông báo", price: "300đ / thông báo", cost: "₫66.000.000" },
        { name: "Transfer", quantity: "85.000", unit: "GD thành công", price: "2.000đ / GD", cost: "₫170,000,000" },
        { name: "Deeplink", quantity: "28.363", unit: "lượt", price: "100đ / lượt", cost: "₫2,836,364" },
      ]
    },
    {
      cycle: "Tháng 03/2026",
      total: "₫275,500,000",
      subtotal: "₫250,454,545",
      vat: "₫25,045,455",
      status: "Đã thanh toán",
      date: "02/04/2026",
      invoice: true,
      items: [
        { name: "Grant Connection", quantity: "1.800", unit: "connections", price: "Miễn phí", cost: "₫0" },
        { name: "Transaction", quantity: "280.000", unit: "calls", price: "30.000đ/1.000 API calls", cost: "₫12.400.000" },
        { name: "QR Pay", quantity: "90.000", unit: "GD thành công", price: "50đ + 0.3% / GD", cost: "₫9.200.000" },
        { name: "Virtual Account", quantity: "1.000", unit: "VA hoạt động", price: "1.000đ / VA", cost: "₫1.000.000" },
        { name: "Balance Hook", quantity: "210.000", unit: "thông báo", price: "300đ / thông báo", cost: "₫63.000.000" },
        { name: "Transfer", quantity: "81.000", unit: "GD thành công", price: "2.000đ / GD", cost: "₫162,000,000" },
        { name: "Deeplink", quantity: "28.545", unit: "lượt", price: "100đ / lượt", cost: "₫2,854,545" },
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
    { tab: "Connection" as const, name: "Grant scope (Connection)", quantity: "2.847", unit: "lần", price: "0đ", cost: "₫0" },
    { tab: "Transaction" as const, name: "Transaction scope", quantity: "62", unit: "lần", price: "100.000đ", cost: "₫6.200.000" },
    { tab: "Transaction" as const, name: "Transaction Request", quantity: "426.800", unit: "lần", price: "30đ", cost: "₫12.804.000" },
    { tab: "QRPay" as const, name: "QR Pay Transaction", quantity: "132.400", unit: "lần", price: "50đ + 0.3%", cost: "₫14.280.000" },
    { tab: "VirtualAccount" as const, name: "Virtual Account Active", quantity: "1.520", unit: "tài khoản", price: "1.000đ", cost: "₫1.520.000" },
    { tab: "BalanceHook" as const, name: "Balance Hook notification", quantity: "280.900", unit: "lần", price: "300đ", cost: "₫84.270.000" },
    { tab: "Transfer" as const, name: "Transfer Transaction", quantity: "107.800", unit: "lần", price: "2.000đ", cost: "₫215.600.000" },
    { tab: "Deeplink" as const, name: "Deeplink request", quantity: "115.400", unit: "lần", price: "100đ", cost: "₫11.540.000" },
  ];

  return <div className="usage-total" style={{ padding: "8px 0" }}>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "20px", alignItems: "start", width: "100%" }}>
      {/* Left Panel: Invoice Breakdown Table */}
      <div className="panel" style={{ padding: "28px 32px", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        {/* Heading */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-color)" }}>Chi phí theo dịch vụ</h2>
            <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
              Kỳ sử dụng: <strong style={{ color: "var(--text-color)" }}>Tháng 07/2026</strong> (01/07/2026 – 31/07/2026) · Gói Vendor
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
              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: "15px" }}>₫346,214,000</td>
            </tr>
            <tr style={{ background: "rgba(0,0,0,0.01)" }}>
              <td colSpan={3} style={{ padding: "12px 14px" }}></td>
              <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)", fontWeight: 500, fontSize: "14px" }}>Thuế VAT (10%):</td>
              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, fontSize: "15px" }}>₫34,621,400</td>
            </tr>
            <tr style={{ background: "rgba(0,0,0,0.03)", borderTop: "1px solid var(--border-color)" }}>
              <td colSpan={3} style={{ padding: "12px 14px" }}></td>
              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: "15px" }}>Tổng cộng:</td>
              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--purple)", fontSize: "18px" }}>₫380,835,400</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Right Sticky Summary Card */}
      <div className="panel invoice-summary" style={{ padding: "24px", background: "white", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", position: "sticky", top: "16px" }}>
        <div className="invoice-status-line" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span className="invoice-label" style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>KỲ THANH TOÁN</span>
          <span className={`invoice-payment-status ${paymentState}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: paymentState === "paid" ? "#10b981" : "#d97706", background: paymentState === "paid" ? "rgba(16,185,129,0.1)" : "rgba(217,119,6,0.1)", padding: "3px 10px", borderRadius: "12px" }}>
            <i style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
            {paymentState === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "4px 0 16px" }}>Tháng 07/2026</h2>
        
        <dl style={{ margin: "0 0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: "15px" }}>
            <dt style={{ color: "var(--muted)" }}>Tạm tính</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>₫346,214,000</dd>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: "15px" }}>
            <dt style={{ color: "var(--muted)" }}>Thuế VAT (10%)</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>₫34,621,400</dd>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0", fontSize: "16px" }}>
            <dt style={{ fontWeight: 700 }}>Tổng thanh toán</dt>
            <dd style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "var(--purple)" }}>₫380,835,400</dd>
          </div>
        </dl>

        {/* VAT Toggle Checkbox */}
        <div style={{ background: "var(--bg-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "18px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 500, margin: 0, fontSize: "14px" }}>
            <input type="checkbox" checked={wantEinvoice} onChange={e => {
              const checked = e.target.checked;
              setWantEinvoice(checked);
              if (checked) setShowInvoiceModal(true);
            }} style={{ width: "15px", height: "15px" }} />
            <span>Xuất hóa đơn VAT điện tử (e-Invoice)</span>
          </label>
          {wantEinvoice && (
            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <div style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "210px" }}>
                <strong>{einvoiceCompany}</strong>
              </div>
              <button type="button" style={{ border: "none", background: "none", color: "var(--purple)", cursor: "pointer", fontSize: "13px", fontWeight: 600, padding: 0 }} onClick={() => setShowInvoiceModal(true)}>
                Sửa ✎
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {paymentState === "paid" ? (
            <button className="primary-button" onClick={() => showNotice(wantEinvoice ? `Đã tải hoá đơn điện tử gửi tới ${einvoiceEmail}` : "Đã tải chứng từ thanh toán")} style={{ width: "100%", height: "40px", padding: 0 }}>
              {wantEinvoice ? "⇩ Tải hóa đơn VAT (.pdf)" : "⇩ Tải chứng từ thanh toán"}
            </button>
          ) : (
            <button className="primary-button payment-button" onClick={() => setPaymentState("scanning")} style={{ width: "100%", height: "42px", padding: 0, background: "var(--purple)", fontWeight: 600, fontSize: "16px" }}>
              Thanh toán
            </button>
          )}
          <button className="invoice-secondary" onClick={() => setShowHistoryModal(true)} style={{ width: "100%", height: "38px", cursor: "pointer", fontSize: "14px", margin: 0 }}>
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

    {showHistoryModal && <div className="payment-screen" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
      <div className="invoice-modal-dialog" style={{ width: "min(780px, 94vw)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="payment-heading">
          <div>
            <span>BILLING & INVOICE</span>
            <h2 id="history-modal-title">Lịch sử thanh toán</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--muted)" }}>Chọn một kỳ thanh toán bên dưới để xem bảng kê chi tiết dịch vụ và tải hóa đơn.</p>
          </div>
          <button aria-label="Đóng" onClick={() => { setShowHistoryModal(false); setSelectedHistoryCycle(null); }}>×</button>
        </div>
        <div className="invoice-modal-body" style={{ padding: 0, display: "block", overflowY: "auto", flex: 1 }}>
          {!selectedHistoryCycle ? (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)", position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>Kỳ thanh toán</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>Tổng tiền</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>Trạng thái</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>Hóa đơn VAT</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: 14, color: "var(--muted)", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {historyCycles.map(cycle => (
                  <tr key={cycle.cycle} style={{ borderBottom: "1px solid var(--border-color)", cursor: "pointer", transition: "background 0.2s" }} onClick={() => setSelectedHistoryCycle(cycle)} onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-color)" }}>{cycle.cycle}</span>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>Mã HD: CAS-{cycle.cycle.replace("Tháng ", "").replace("/", "-")}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-color)" }}>{cycle.total}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 20 }}>
                        <i style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} /> {cycle.status}
                      </span>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>vào {cycle.date}</div>
                    </td>
                    <td style={{ padding: "16px 24px", color: cycle.invoice ? "var(--purple)" : "var(--muted)", fontSize: 15, fontWeight: 500 }}>
                      {cycle.invoice ? "✓ Đã xuất HĐĐT" : "Không yêu cầu"}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <span className="invoice-secondary" style={{ padding: "6px 12px", fontSize: 14, display: "inline-block", borderRadius: 4, fontWeight: 500 }}>Xem chi tiết →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24 }}>
              <button style={{ background: "transparent", border: "none", color: "var(--purple)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 16, marginBottom: 20, padding: 0, fontWeight: 600 }} onClick={() => setSelectedHistoryCycle(null)}>
                ← Quay lại danh sách lịch sử
              </button>
              
              <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 22, margin: 0 }}>Chi tiết thanh toán {selectedHistoryCycle.cycle}</h3>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: 20 }}>
                  <i style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} /> {selectedHistoryCycle.status}
                </span>
              </div>

              <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px", background: "var(--bg-card)", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid var(--border-color)" }}>
                <div><dt style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Tổng tiền thanh toán</dt><dd style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--text-color)" }}>{selectedHistoryCycle.total}</dd></div>
                <div><dt style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Thời gian thanh toán</dt><dd style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>10:24 {selectedHistoryCycle.date}</dd></div>
                <div><dt style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Phương thức</dt><dd style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>Chuyển khoản VietQR (MB Bank)</dd></div>
                <div><dt style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>Mã giao dịch</dt><dd style={{ fontSize: 17, fontWeight: 500, margin: 0, fontFamily: "monospace" }}>FT26{selectedHistoryCycle.cycle.replace("Tháng ", "").replace("/", "")}8F7A</dd></div>
              </dl>

              <h4 style={{ fontSize: 16, marginBottom: 12, textTransform: "uppercase", fontWeight: 600, color: "var(--muted)" }}>Bảng kê chi tiết dịch vụ</h4>
              <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border-color)" }}>
                    <tr>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--muted)", textAlign: "left" }}>Tên dịch vụ</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--muted)", textAlign: "right" }}>Số lượng</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--muted)", textAlign: "right" }}>Đơn vị tính</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--muted)", textAlign: "right" }}>Đơn giá</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--muted)", textAlign: "right" }}>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedHistoryCycle.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx === selectedHistoryCycle.items.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>{item.quantity}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--muted)" }}>{item.unit}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--muted)" }}>{item.price}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-color)", textAlign: "right" }}>{item.cost}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
                      <td colSpan={3} style={{ padding: "12px 16px" }}></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--muted)", fontWeight: 500 }}>Tạm tính:</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{selectedHistoryCycle.subtotal}</td>
                    </tr>
                    <tr style={{ background: "rgba(0,0,0,0.01)" }}>
                      <td colSpan={3} style={{ padding: "12px 16px" }}></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--muted)", fontWeight: 500 }}>Thuế VAT (10%):</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>{selectedHistoryCycle.vat}</td>
                    </tr>
                    <tr style={{ background: "rgba(0,0,0,0.03)", borderTop: "1px solid var(--border-color)" }}>
                      <td colSpan={3} style={{ padding: "12px 16px" }}></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>Tổng cộng:</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--purple)", fontSize: 15 }}>{selectedHistoryCycle.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 style={{ fontSize: 16, marginBottom: 12, textTransform: "uppercase", fontWeight: 600, color: "var(--muted)" }}>Thông tin e-Invoice</h4>
              <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                {selectedHistoryCycle.invoice ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                    <div><strong style={{ color: "var(--muted)" }}>Đơn vị mua:</strong> <div style={{ fontWeight: 500, marginTop: 2 }}>{einvoiceCompany}</div></div>
                    <div><strong style={{ color: "var(--muted)" }}>Mã số thuế:</strong> <div style={{ fontWeight: 500, marginTop: 2 }}>{einvoiceTaxId}</div></div>
                    <div><strong style={{ color: "var(--muted)" }}>Địa chỉ:</strong> <div style={{ fontWeight: 500, marginTop: 2 }}>{einvoiceAddress}</div></div>
                    <div><strong style={{ color: "var(--muted)" }}>Email nhận:</strong> <div style={{ fontWeight: 500, marginTop: 2 }}>{einvoiceEmail}</div></div>
                  </div>
                ) : (
                  <div style={{ color: "var(--muted)", fontStyle: "italic" }}>Giao dịch thanh toán không yêu cầu xuất hóa đơn VAT điện tử.</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                <button className="invoice-secondary" onClick={() => setSelectedHistoryCycle(null)}>Quay lại</button>
                <button className="primary-button" onClick={() => showNotice("Đã tải chứng từ thanh toán")}>⇩ Tải chứng từ thanh toán (PDF)</button>
                {selectedHistoryCycle.invoice && <button className="primary-button" style={{ background: "var(--purple)" }} onClick={() => showNotice("Đã tải hóa đơn điện tử e-Invoice VAT (.pdf)")}>⇩ Tải Hóa đơn điện tử VAT (.pdf)</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>}
  </div>;
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
    const values = [data.columns[index], ...data.rows.map(row => row[index] ?? "")];
    const longest = Math.max(...values.map(value => String(value).length));
    const extra = data.columns[index] === "Ngân hàng" ? 54 : 32;
    const maximum = data.columns[index] === "Scope" ? 320 : 280;
    return Math.min(maximum, Math.max(data.columns[index] === "STT" ? 58 : 82, longest * 7 + extra));
  }
  const [columnWidths, setColumnWidths] = useState(() => data.columns.map((_, index) => autoWidthFor(index)));
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);

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
      <label><span>⌕</span><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Tìm bằng Request ID, Grant ID hoặc endpoint" /></label>
    </div>
    <div className="logs-filter-row">
      <div>
        <select value={route} onChange={e => { setRoute(e.target.value); setPage(1); }} aria-label="API routes"><option>Tất cả API routes</option>{[...new Set(logRecordsData.map(log => log.endpoint))].map(item => <option key={item}>{item}</option>)}</select>
        <select value={responseCode} onChange={e => { setResponseCode(e.target.value); setPage(1); }} aria-label="Response code"><option>Tất cả response</option><option>2xx Thành công</option><option>4xx / 5xx Lỗi</option></select>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} aria-label="Thời gian"><option>24 giờ qua</option><option>7 ngày qua</option><option>30 ngày qua</option></select>
        <select value={bank} onChange={e => { setBank(e.target.value); setPage(1); }} aria-label="Ngân hàng"><option>Tất cả ngân hàng</option>{[...new Set(logRecordsData.map(log => log.bank))].map(item => <option key={item}>{item}</option>)}</select>
      </div>
      <button className="logs-reset" onClick={resetFilters}>↻ Đặt lại</button>
      <button className="logs-export" onClick={exportLogs}>⇩ Xuất logs</button>
    </div>
    <div className="logs-table-wrap">
      <table className="logs-table">
        <thead><tr><th /><th>Request ID</th><th>Ngân hàng</th><th>Trạng thái HTTP</th><th>Đường dẫn request</th><th>Grant ID</th><th>Ngày tạo</th></tr></thead>
        <tbody>{visible.map(log => <tr key={log.requestId} tabIndex={0} onClick={() => { setSelectedLog(log); setDetailTab("request"); }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelectedLog(log); }}>
          <td><span className="row-chevron">›</span></td>
          <td><strong>{log.requestId}</strong><small>{log.method} · {log.scope}</small></td>
          <td>{log.bank}</td>
          <td><span className={`log-http ${log.http.startsWith("2") ? "success" : "failed"}`}>{log.http.startsWith("2") ? "✓" : "×"} {log.http}</span></td>
          <td><code>{log.endpoint}</code></td>
          <td><code>{log.grantId}</code></td>
          <td>{log.createdAt}<small>{log.latency}</small></td>
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
          <div><span>{detailTab === "request" ? "Request body" : "Response body"}</span><button onClick={() => { navigator.clipboard?.writeText(detailTab === "request" ? selectedLog.requestBody : selectedLog.responseBody); showNotice("Đã sao chép JSON"); }}>Sao chép</button></div>
          <pre><code>{detailTab === "request" ? selectedLog.requestBody : selectedLog.responseBody}</code></pre>
        </div>
        <div className="log-headers"><h3>Headers</h3><div><span>x-request-id</span><code>{selectedLog.requestId}</code></div><div><span>x-client-id</span><code>33d42bee-••••-••••-••••-51e958e065ae</code></div><div><span>content-type</span><code>application/json</code></div></div>
      </aside>
    </div>}
  </section>;
}

function OnboardingScreen({ enabledScopes, setEnabledScopes, onNavigate, showNotice }: { enabledScopes: AnalyticsTab[]; setEnabledScopes: React.Dispatch<React.SetStateAction<AnalyticsTab[]>>; onNavigate: (page: string) => void; showNotice: (message: string) => void }) {
  const [draftScopes, setDraftScopes] = useState<AnalyticsTab[]>(enabledScopes);

  const allServices: { key: AnalyticsTab; title: string; desc: string; price: string }[] = [
    { key: "Transaction", title: "Transaction API", desc: "Lịch sử giao dịch & truy vấn sao kê ngân hàng", price: "50đ / call" },
    { key: "QRPay", title: "QRPay API", desc: "Tạo & nhận thanh toán VietQR / Dynamic QR", price: "40đ / GD" },
    { key: "Deeplink", title: "Deeplink API", desc: "Khởi tạo link gọi app ngân hàng thanh toán", price: "100đ / lượt" },
    { key: "VirtualAccount", title: "Virtual Account", desc: "Tài khoản định danh thu hộ tự động", price: "1.000đ / VA" },
    { key: "BalanceHook", title: "Balance Hook", desc: "Webhook thông báo biến động số dư realtime", price: "300đ / thông báo" },
    { key: "Transfer", title: "Transfer API", desc: "Chuyển tiền nhanh 24/7 qua API", price: "2.000đ / GD" },
    { key: "Identity", title: "Identity API", desc: "Truy vấn & xác thực chủ tài khoản ngân hàng", price: "60đ / call" },
    { key: "Balance", title: "Balance API", desc: "Tra cứu số dư tài khoản ngân hàng tức thì", price: "35đ / call" },
    { key: "eKYC", title: "eKYC Verification", desc: "Xác thực khuôn mặt & đọc thông tin CCCD", price: "80đ / lượt" },
    { key: "Invoice", title: "Invoice API", desc: "Quản lý & tra cứu hoá đơn điện tử", price: "50đ / HĐ" },
  ];

  function toggleScope(key: AnalyticsTab) {
    if (draftScopes.includes(key)) {
      if (draftScopes.length <= 1) {
        showNotice("App cần giữ ít nhất 1 dịch vụ API");
        return;
      }
      setDraftScopes(draftScopes.filter(k => k !== key));
    } else {
      setDraftScopes([...draftScopes, key]);
    }
  }

  function handleSave() {
    setEnabledScopes(draftScopes);
    showNotice(`✓ Đã lưu thành công ${draftScopes.length} dịch vụ API! Sidebar Usage đã được cập nhật.`);
  }

  const isModified = JSON.stringify([...draftScopes].sort()) !== JSON.stringify([...enabledScopes].sort());

  return <div className="onboarding-layout">
    <section className="onboarding-welcome">
      <div><span className="guide-eyebrow">QUICK START</span><h2>Onboarding & Lựa chọn Dịch vụ API</h2><p>Chọn các dịch vụ Open Banking mà App muốn sử dụng. Bấm "Lưu danh sách dịch vụ" để cập nhật vào menu Usage.</p></div>
      <FormButton variant="primary" size="md" onClick={() => onNavigate("Userguide")}>
        Mở tài liệu API (Userguide) ↗
      </FormButton>
    </section>

    {/* Scope Selector Section */}
    <section className="scope-selector-section">
      <div className="scope-selector-header">
        <div>
          <h3>Lựa chọn Dịch vụ API Onboarding ({draftScopes.length} / 10 đã chọn)</h3>
          <p>Tích chọn dịch vụ cần dùng. Sau khi bấm "Lưu", menu Usage và tài liệu Hướng dẫn API (Userguide) sẽ hiển thị đúng danh sách đã chọn.</p>
        </div>
        <FormButton
          variant={isModified ? "primary" : "secondary"}
          size="md"
          onClick={handleSave}
        >
          {isModified ? "💾 Lưu danh sách dịch vụ (Chưa lưu)" : "✓ Đã lưu danh sách dịch vụ"}
        </FormButton>
      </div>
      <div className="scope-grid">
        {allServices.map(srv => {
          const active = draftScopes.includes(srv.key);
          return (
            <div
              key={srv.key}
              className={`scope-card ${active ? "active" : ""}`}
              onClick={() => toggleScope(srv.key)}
            >
              <div className="scope-card-top">
                <strong>{srv.title}</strong>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleScope(srv.key)}
                  className="scope-checkbox"
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="scope-card-desc">{srv.desc}</div>
              <div className="scope-card-footer">
                <span>{srv.price}</span>
                <span style={{ color: active ? "var(--purple)" : "var(--muted)" }}>{active ? "✓ Đã chọn" : "+ Bấm để chọn"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <div className="sandbox-note" style={{ marginTop: 20 }}><span>i</span><div><strong>Hướng dẫn Onboarding</strong><p>Sau khi chọn xong dịch vụ, bạn có thể chuyển sang mục <strong>Userguide</strong> ở menu bên trái để xem hướng dẫn tích hợp chi tiết và thử nghiệm Sandbox.</p></div></div>
  </div>;
}

function UserguideScreen({
  enabledScopes,
  showNotice,
  onRunTest
}: {
  enabledScopes: AnalyticsTab[];
  showNotice: (message: string) => void;
  onRunTest: (scope: AnalyticsTab, params: { bank: string; amount?: string; accountName?: string; note?: string }) => void;
}) {
  const activeList = enabledScopes.length > 0 ? enabledScopes : ["Transaction", "QRPay", "Deeplink"];
  const [selectedCategory, setSelectedCategory] = useState<string>(activeList[0] || "Transaction");
  const [selectedApiIndex, setSelectedApiIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(1);

  const [testBank, setTestBank] = useState("Techcombank");
  const [testAmount, setTestAmount] = useState("1500000");
  const [testAccountName, setTestAccountName] = useState("Nguyễn Minh Anh");
  const [testNote, setTestNote] = useState("Thanh toan don hang #10928");

  type ServiceProductDoc = {
    title: string;
    desc: string;
    scopeName: string;
    flow: { step: string; title: string; desc: string }[];
    apis: {
      name: string;
      method: "POST" | "GET" | "DELETE";
      url: string;
      scope: string;
      summary: string;
      headers?: { name: string; type: string; req: boolean; desc: string }[];
      params: { name: string; type: string; req: boolean; desc: string }[];
      sampleReq: string;
      sampleRes: string;
    }[];
  };

  const productDocs: Record<string, ServiceProductDoc> = {
    Transaction: {
      title: "Bank Account Transaction History API",
      desc: "API truy vấn lịch sử giao dịch sao kê tự động cho tài khoản ngân hàng kết nối (chuẩn Open Banking).",
      scopeName: "transactions",
      flow: [
        { step: "Bước 1", title: "Khởi tạo Grant", desc: "Tạo grantToken với scope transactions." },
        { step: "Bước 2", title: "Mở Cas Link", desc: "End-user đăng nhập tài khoản ngân hàng và cấp quyền." },
        { step: "Bước 3", title: "Đổi accessToken & Gọi API", desc: "Đổi publicToken lấy accessToken và truy vấn sao kê." }
      ],
      apis: [
        {
          name: "Lấy danh sách giao dịch",
          method: "GET",
          url: "https://sandbox.bankhub.dev/v2/transactions",
          scope: "transactions",
          summary: "Truy vấn danh sách biến động số dư theo khoảng thời gian và phân trang.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken> nhận được sau khi kết nối Cas Link" },
            { name: "x-client-id", type: "String", req: true, desc: "Client ID của ứng dụng" }
          ],
          params: [
            { name: "fromDate", type: "String", req: true, desc: "Từ ngày tra cứu (định dạng YYYY-MM-DD, VD: 2026-08-01)" },
            { name: "toDate", type: "String", req: true, desc: "Đến ngày tra cứu (định dạng YYYY-MM-DD, VD: 2026-08-14)" },
            { name: "page", type: "Number", req: false, desc: "Số trang cần truy vấn (mặc định: 1)" },
            { name: "pageSize", type: "Number", req: false, desc: "Số bản ghi trên mỗi trang (mặc định: 20, tối đa: 100)" }
          ],
          sampleReq: "GET /v2/transactions?fromDate=2026-08-01&toDate=2026-08-14&page=1&pageSize=20 HTTP/1.1\nHost: sandbox.bankhub.dev\nAuthorization: Bearer at_3f2e1d0c9b8a7c6d5e4fabcdef123456\nx-client-id: app_8F2KD91M",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"page\": 1,\n    \"pageSize\": 20,\n    \"total\": 54,\n    \"records\": [\n      {\n        \"id\": \"txn_8920194812\",\n        \"reference\": \"FT26081498102931\",\n        \"amount\": 1500000,\n        \"description\": \"NGUYEN MINH ANH chuyen tien DH10928\",\n        \"transactionDate\": \"2026-08-14 15:42:10\",\n        \"type\": \"CREDIT\",\n        \"accountNumber\": \"19038291029102\",\n        \"bank\": \"Techcombank\",\n        \"corresponsiveAccount\": \"09823192019\",\n        \"corresponsiveName\": \"NGUYEN MINH ANH\"\n      }\n    ]\n  }\n}"
        },
        {
          name: "Đồng bộ giao dịch tức thì",
          method: "POST",
          url: "https://sandbox.bankhub.dev/v2/transactions/sync",
          scope: "transactions",
          summary: "Kích hoạt đồng bộ giao dịch mới nhất trực tiếp từ ngân hàng vào hệ thống.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken>" },
            { name: "Content-Type", type: "String", req: true, desc: "application/json" }
          ],
          params: [
            { name: "bank", type: "String", req: true, desc: "Tên ngân hàng liên kết (Techcombank, Vietcombank...)" },
            { name: "accountNumber", type: "String", req: true, desc: "Số tài khoản ngân hàng đã cấp quyền" }
          ],
          sampleReq: "{\n  \"bank\": \"Techcombank\",\n  \"accountNumber\": \"19038291029102\"\n}",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Sync triggered successfully\",\n  \"data\": {\n    \"syncedAt\": \"2026-08-14 17:30:00\",\n    \"newTransactions\": 3\n  }\n}"
        }
      ]
    },
    QRPay: {
      title: "VietQR & Dynamic QRPay Solution",
      desc: "Giải pháp khởi tạo mã VietQR động theo chuẩn Napas247 cho phép nhận tiền chuyển khoản ngân hàng tự động 24/7.",
      scopeName: "qrpay",
      flow: [
        { step: "Bước 1", title: "Khởi tạo mã VietQR", desc: "Gọi POST /v2/qr/create truyền số tiền và nội dung đơn hàng." },
        { step: "Bước 2", title: "Khách hàng quét mã", desc: "Mở App ngân hàng quét mã VietQR và xác nhận chuyển khoản." },
        { step: "Bước 3", title: "Nhận Webhook tức thì", desc: "Hệ thống CAS tự động bắn Webhook báo kết quả tiền đã vào." }
      ],
      apis: [
        {
          name: "Tạo mã VietQR động",
          method: "POST",
          url: "https://sandbox.bankhub.dev/v2/qr/create",
          scope: "qrpay",
          summary: "Tạo mã VietQR kèm số tiền và nội dung chuyển khoản tự động.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken>" },
            { name: "x-client-id", type: "String", req: true, desc: "Client ID ứng dụng" },
            { name: "Content-Type", type: "String", req: true, desc: "application/json" }
          ],
          params: [
            { name: "bank", type: "String", req: true, desc: "Mã ngân hàng (TCB, VCB, MB, ACB, BIDV...)" },
            { name: "amount", type: "Number", req: true, desc: "Số tiền cần thanh toán (VNĐ)" },
            { name: "note", type: "String", req: true, desc: "Nội dung chuyển khoản (VD: Thanh toan DH1029)" }
          ],
          sampleReq: "{\n  \"bank\": \"Vietcombank\",\n  \"amount\": 2500000,\n  \"note\": \"Thanh toan QR DH1029\"\n}",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"qrId\": \"qr_8492019\",\n    \"qrImage\": \"https://qr.bankhub.dev/v2/image.png\",\n    \"qrRaw\": \"00020101021238580010A000000727...\"\n  }\n}"
        },
        {
          name: "Tra cứu trạng thái QR",
          method: "GET",
          url: "https://sandbox.bankhub.dev/v2/qr/{id}/status",
          scope: "qrpay",
          summary: "Kiểm tra khách hàng đã quét mã và chuyển tiền thành công hay chưa.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken>" }
          ],
          params: [
            { name: "qrId", type: "String", req: true, desc: "Mã định danh mã QR đã tạo" }
          ],
          sampleReq: "GET /v2/qr/qr_8492019/status HTTP/1.1\nHost: sandbox.bankhub.dev\nAuthorization: Bearer at_3f2e1d0c9b8a7c6d5e4fabcdef123456",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"status\": \"PAID\",\n    \"qrId\": \"qr_8492019\",\n    \"amount\": 2500000,\n    \"paidAt\": \"2026-08-14 17:04:12\"\n  }\n}"
        }
      ]
    },
    Deeplink: {
      title: "App-to-App Deeplink Solution",
      desc: "Giải pháp tự động kích hoạt App ngân hàng trên điện thoại end-user với thông tin chuyển tiền đã được điền sẵn 100%.",
      scopeName: "deeplink",
      flow: [
        { step: "Bước 1", title: "Khởi tạo Deeplink", desc: "Gọi POST /v2/deeplink/generate từ server Vendor." },
        { step: "Bước 2", title: "Khách hàng nhấp Link", desc: "Tự động mở App Ngân hàng (Techcombank, VCB, MB...) trên Mobile." },
        { step: "Bước 3", title: "Xác nhận & Chuyển tiền", desc: "Khách hàng nhập OTP/Vân tay để hoàn tất thanh toán." }
      ],
      apis: [
        {
          name: "Khởi tạo Deeplink",
          method: "POST",
          url: "https://sandbox.bankhub.dev/v2/deeplink/generate",
          scope: "deeplink",
          summary: "Tạo link chuyển hướng mở App Ngân hàng kèm thông tin điền sẵn.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken>" },
            { name: "Content-Type", type: "String", req: true, desc: "application/json" }
          ],
          params: [
            { name: "bank", type: "String", req: true, desc: "Tên/Mã ngân hàng nhận tiền" },
            { name: "amount", type: "Number", req: true, desc: "Số tiền chuyển (VNĐ)" },
            { name: "accountName", type: "String", req: true, desc: "Tên người thụ hưởng" },
            { name: "note", type: "String", req: true, desc: "Nội dung chuyển khoản" }
          ],
          sampleReq: "{\n  \"bank\": \"Techcombank\",\n  \"amount\": 1500000,\n  \"accountName\": \"Nguyễn Minh Anh\",\n  \"note\": \"Thanh toan don hang #10928\"\n}",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"deeplinkUrl\": \"https://dl.bankhub.dev/tcb/pay?id=req_DLK98124\",\n    \"expiresIn\": 1800\n  }\n}"
        }
      ]
    },
    VirtualAccount: {
      title: "Virtual Account Collection Solution",
      desc: "Tạo và quản lý các tài khoản thu hộ định danh cấp tự động cho từng khách hàng.",
      scopeName: "virtual_account",
      flow: [
        { step: "Bước 1", title: "Tạo tài khoản VA", desc: "Gọi POST /v2/virtual-accounts cấp cho từng khách hàng." },
        { step: "Bước 2", title: "Khách hàng nộp tiền", desc: "Chuyển tiền vào số tài khoản VA vừa cấp." },
        { step: "Bước 3", title: "Nhận thông báo nộp tiền", desc: "Hệ thống tự động nhận diện và cộng tiền tức thì." }
      ],
      apis: [
        {
          name: "Tạo tài khoản VA mới",
          method: "POST",
          url: "https://sandbox.bankhub.dev/v2/virtual-accounts",
          scope: "virtual_account",
          summary: "Khởi tạo số tài khoản định danh thu hộ cho khách hàng.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken>" },
            { name: "Content-Type", type: "String", req: true, desc: "application/json" }
          ],
          params: [
            { name: "accountName", type: "String", req: true, desc: "Tên hiển thị tài khoản thu hộ" },
            { name: "bank", type: "String", req: true, desc: "Ngân hàng liên kết (ACB, TCB, VCB...)" }
          ],
          sampleReq: "{\n  \"accountName\": \"Công ty CP Minh Long\",\n  \"bank\": \"ACB\"\n}",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"accountNumber\": \"99021842019\",\n    \"accountName\": \"CAS MINH LONG\",\n    \"bank\": \"ACB\"\n  }\n}"
        }
      ]
    },
    Transfer: {
      title: "24/7 API Money Transfer Solution",
      desc: "Giải pháp thực hiện lệnh chuyển tiền nhanh Napas 24/7 tự động qua API.",
      scopeName: "transfer",
      flow: [
        { step: "Bước 1", title: "Khởi tạo lệnh", desc: "Tạo request chuyển tiền kèm thông tin người thụ hưởng." },
        { step: "Bước 2", title: "Xác thực giao dịch", desc: "Trình ký và xác thực iOTP / OTP." },
        { step: "Bước 3", title: "Nhận kết quả 24/7", desc: "Nhận kết quả giao dịch và mã tham chiếu Napas." }
      ],
      apis: [
        {
          name: "Tạo lệnh chuyển tiền 24/7",
          method: "POST",
          url: "https://sandbox.bankhub.dev/v2/transfers",
          scope: "transfer",
          summary: "Tạo request lệnh chuyển tiền nhanh sang tài khoản bất kỳ.",
          headers: [
            { name: "Authorization", type: "String", req: true, desc: "Bearer <accessToken>" },
            { name: "Content-Type", type: "String", req: true, desc: "application/json" }
          ],
          params: [
            { name: "bank", type: "String", req: true, desc: "Ngân hàng nhận" },
            { name: "accountNumber", type: "String", req: true, desc: "Số tài khoản nhận tiền" },
            { name: "amount", type: "Number", req: true, desc: "Số tiền cần chuyển" },
            { name: "note", type: "String", req: true, desc: "Nội dung chuyển khoản" }
          ],
          sampleReq: "{\n  \"bank\": \"Vietcombank\",\n  \"accountNumber\": \"1029381902\",\n  \"amount\": 5000000,\n  \"note\": \"Chi tra luong T8\"\n}",
          sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"transferId\": \"trf_98102938\",\n    \"status\": \"SUCCESS\",\n    \"napasRef\": \"NP260814981023\"\n  }\n}"
        }
      ]
    },
    BalanceHook: {
      title: "Real-time Balance Webhook Notification",
      desc: "Giải pháp bắn Webhook sự kiện biến động số dư tài khoản ngân hàng theo thời gian thực.",
      scopeName: "balance_hook",
      flow: [
        { step: "Bước 1", title: "Khai báo Webhook", desc: "Khai báo URL nhận thông báo biến động số dư tại phần Webhooks." },
        { step: "Bước 2", title: "Biến động số dư", desc: "Tài khoản ngân hàng phát sinh giao dịch tiền vào / tiền ra." },
        { step: "Bước 3", title: "Bắn Webhook Event", desc: "CAS gửi payload JSON sang server của bạn trong 500ms." }
      ],
      apis: [
        {
          name: "Kiểm thử Balance Webhook",
          method: "POST",
          url: "https://sandbox.bankhub.dev/v2/balance/webhook/test",
          scope: "balance_hook",
          summary: "Gửi một payload Webhook sự kiện biến động số dư giả lập.",
          headers: [
            { name: "x-client-id", type: "String", req: true, desc: "Client ID ứng dụng" },
            { name: "Content-Type", type: "String", req: true, desc: "application/json" }
          ],
          params: [
            { name: "event", type: "String", req: true, desc: "Loại sự kiện (balance.credited, balance.debited)" },
            { name: "amount", type: "Number", req: true, desc: "Số tiền phát sinh" }
          ],
          sampleReq: "{\n  \"event\": \"balance.credited\",\n  \"amount\": 5000000\n}",
          sampleRes: "{\n  \"status\": \"DELIVERED\",\n  \"httpCode\": 200,\n  \"response\": \"OK\"\n}"
        }
      ]
    }
  };

  const commonApis = (scopeName: string, serviceTitle: string) => [
    {
      name: "API get Grant Token",
      method: "POST" as const,
      url: "https://sandbox.bankhub.dev/grant/token",
      scope: scopeName,
      summary: `Tạo phân quyền truy cập (Grant) cho dịch vụ ${serviceTitle} để cấp quyền liên kết tài khoản ngân hàng.`,
      headers: [
        { name: "x-client-id", type: "String", req: true, desc: "Client ID cấp trong mục API keys" },
        { name: "x-secret-key", type: "String", req: true, desc: "API secret key của ứng dụng (chỉ dùng ở server backend)" },
        { name: "Content-Type", type: "String", req: true, desc: "application/json" }
      ],
      params: [
        { name: "scopes", type: "String", req: true, desc: `Quyền cần cấp, truyền: "${scopeName}" (hoặc phân tách bằng dấu phẩy nếu nhiều quyền)` },
        { name: "redirect_url", type: "String", req: false, desc: "URL chuyển hướng callback sau khi người dùng liên kết qua Cas Link" }
      ],
      sampleReq: `{\n  "scopes": "${scopeName}",\n  "redirect_url": "https://yourapp.com/callback"\n}`,
      sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"grantToken\": \"gt_7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c\"\n  }\n}"
    },
    {
      name: "Cas Link (Lấy publicToken)",
      method: "GET" as const,
      url: "https://link.bankhub.dev",
      scope: "cas_link",
      summary: "Chuyển hướng end-user đến Cas Link kèm grantToken để chọn ngân hàng, đăng nhập và uỷ quyền truy cập.",
      headers: [
        { name: "None", type: "None", req: false, desc: "Gọi trực tiếp từ Browser / WebView của end-user" }
      ],
      params: [
        { name: "grantToken", type: "String", req: true, desc: "Mã token nhận được từ bước gọi POST /grant/token" },
        { name: "redirectUri", type: "String", req: true, desc: "URL để hệ thống redirect về kèm publicToken sau khi liên kết thành công" }
      ],
      sampleReq: `GET https://link.bankhub.dev/?grantToken=gt_7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c&redirectUri=https://yourapp.com/callback HTTP/1.1`,
      sampleRes: "HTTP/1.1 302 Found\nLocation: https://yourapp.com/callback?publicToken=pt_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
    },
    {
      name: "API get accessToken",
      method: "POST" as const,
      url: "https://sandbox.bankhub.dev/grant/exchange",
      scope: "exchange",
      summary: "Đổi publicToken lấy accessToken và grantId vĩnh viễn ở server để gọi các API nghiệp vụ.",
      headers: [
        { name: "x-client-id", type: "String", req: true, desc: "Client ID cấp trong mục API keys" },
        { name: "x-secret-key", type: "String", req: true, desc: "API secret key của ứng dụng" },
        { name: "Content-Type", type: "String", req: true, desc: "application/json" }
      ],
      params: [
        { name: "publicToken", type: "String", req: true, desc: "Mã token tạm thời nhận được từ Callback URL của Cas Link" }
      ],
      sampleReq: `{\n  "publicToken": "pt_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"\n}`,
      sampleRes: "{\n  \"code\": \"00\",\n  \"desc\": \"Success\",\n  \"data\": {\n    \"accessToken\": \"at_8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f\",\n    \"grantId\": \"grt_5k6l7m8n-9o0p-1q2r-3s4t-5u6v7w8x9y0z\"\n  }\n}"
    }
  ];

  const actualCategory = selectedCategory === "QuickStart" ? (activeList[0] || "Transaction") : selectedCategory;
  const currDoc = productDocs[actualCategory] || productDocs.Transaction;
  const fullApis = currDoc ? [...commonApis(currDoc.scopeName, currDoc.title), ...currDoc.apis] : [];
  const currentApi = fullApis[selectedApiIndex] || fullApis[0];

  return (
    <div className="userguide-layout">
      {/* Left Menu - Accordion style */}
      <nav className="userguide-nav">
        <div className="nav-header">
          Dịch vụ đã kích hoạt ({activeList.length})
        </div>

        <div>
          {activeList.map(cat => {
            const doc = productDocs[cat];
            if (!doc) return null;
            const catFullApis = [...commonApis(doc.scopeName, doc.title), ...doc.apis];
            const isActiveGroup = actualCategory === cat;
            
            return (
              <div key={cat} className="userguide-nav-group">
                <button
                  type="button"
                  className={`group-btn ${isActiveGroup ? "active" : ""}`}
                  onClick={() => { setSelectedCategory(cat); setSelectedApiIndex(0); }}
                >
                  <span>{usageTabLabel(cat as AnalyticsTab)}</span>
                  <span style={{ fontSize: 12, opacity: 0.6, transform: isActiveGroup ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
                </button>
                {isActiveGroup && (
                  <div className="group-submenus">
                    {catFullApis.map((api, idx) => (
                      <button
                        key={api.name}
                        type="button"
                        className={`submenu-btn ${selectedApiIndex === idx ? "active" : ""}`}
                        onClick={() => setSelectedApiIndex(idx)}
                      >
                        <span className={`endpoint-method ${api.method.toLowerCase()}`}>{api.method}</span>
                        <span>{api.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="userguide-main">
        {/* Product Overview Header */}
        <div className="api-endpoint-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{currDoc.title}</h3>
            <span className="status-pill">Active Service</span>
          </div>
          <p style={{ margin: "0 0 16px 0", color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{currDoc.desc}</p>
          
          <hr style={{ border: "none", borderTop: "1px dashed #e2e4ed", margin: "16px 0" }} />

          {/* Selected API Document Detail */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 18, color: "#1e2130" }}>{currentApi.name}</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span className={`endpoint-method ${currentApi.method.toLowerCase()}`}>{currentApi.method}</span>
              <span className="endpoint-url">{currentApi.url}</span>
              <span className="status-pill" style={{ marginLeft: "auto", fontSize: 10 }}>Scope: {currentApi.scope}</span>
            </div>
            <p style={{ margin: "4px 0 16px", color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{currentApi.summary}</p>

            {/* Headers Table */}
            {currentApi.headers && currentApi.headers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong style={{ fontSize: 14, display: "block", marginBottom: 8, color: "#1e2130" }}>Request Headers</strong>
                <table className="param-table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>Header</th>
                      <th style={{ width: "15%" }}>Kiểu dữ liệu</th>
                      <th style={{ width: "15%" }}>Bắt buộc</th>
                      <th>Mô tả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApi.headers.map(h => (
                      <tr key={h.name}>
                        <td><code>{h.name}</code></td>
                        <td>{h.type}</td>
                        <td>{h.req ? <span style={{ color: "var(--red)", fontWeight: 600 }}>Có</span> : "Không"}</td>
                        <td>{h.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Request Parameters Table */}
            <strong style={{ fontSize: 14, display: "block", marginBottom: 8, color: "#1e2130" }}>
              {currentApi.method === "GET" ? "Query Parameters" : "Request Body Parameters"}
            </strong>
            <table className="param-table">
              <thead>
                <tr>
                  <th>Tham số</th>
                  <th>Kiểu dữ liệu</th>
                  <th>Bắt buộc</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {currentApi.params.map(p => (
                  <tr key={p.name}>
                    <td><code>{p.name}</code></td>
                    <td>{p.type}</td>
                    <td>{p.req ? <span style={{ color: "var(--red)", fontWeight: 600 }}>Có</span> : "Không"}</td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sandbox Playground Form */}
        {currentApi.scope !== "cas_link" && currentApi.scope !== "exchange" && currentApi.name !== "API get Grant Token" && (
          <div className="sandbox-tester-box">
            <div className="sandbox-tester-title">
              <div>
                <h4>🧪 Sandbox Test Playground ({currentApi.name})</h4>
                <small style={{ color: "var(--muted)", fontSize: 11 }}>Nhập thông số và chạy thử request API. Kết quả sẽ cập nhật ngay vào Usage và Request Logs.</small>
              </div>
              <FormButton
                variant="primary"
                size="sm"
                onClick={() => onRunTest(actualCategory as AnalyticsTab, { bank: testBank, amount: testAmount, accountName: testAccountName, note: testNote })}
              >
                ⚡ Chạy Request Test (Sandbox)
              </FormButton>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Ngân hàng
                <FormSelect
                  value={testBank}
                  onChange={e => setTestBank(e.target.value)}
                  options={["Techcombank", "Vietcombank", "MB Bank", "ACB", "BIDV", "Sacombank", "VietinBank", "VPBank", "TPBank"]}
                  size="sm"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Số tiền giao dịch (VNĐ)
                <FormInput
                  value={testAmount}
                  onChange={e => setTestAmount(e.target.value)}
                  placeholder="VD: 1500000"
                  size="sm"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Tên tài khoản / Thụ hưởng
                <FormInput
                  value={testAccountName}
                  onChange={e => setTestAccountName(e.target.value)}
                  placeholder="VD: Nguyễn Minh Anh"
                  size="sm"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Nội dung chuyển khoản
                <FormInput
                  value={testNote}
                  onChange={e => setTestNote(e.target.value)}
                  placeholder="VD: Thanh toan don hang #10928"
                  size="sm"
                />
              </label>
            </div>
          </div>
        )}

        {/* Code Snippets */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="api-endpoint-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ fontSize: 12 }}>Sample Request Body</strong>
              <button
                type="button"
                className="custom-button btn-ghost btn-sm"
                onClick={() => { navigator.clipboard?.writeText(currentApi.sampleReq); showNotice("Đã sao chép Request JSON"); }}
              >
                Sao chép
              </button>
            </div>
            <pre style={{ margin: 0, padding: 12, background: "#171827", color: "#e2e8f0", borderRadius: 8, fontSize: 13, overflowX: "auto", fontFamily: "var(--font-jakarta), monospace" }}>
              <code>{currentApi.sampleReq}</code>
            </pre>
          </div>

          <div className="api-endpoint-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ fontSize: 12 }}>Sample 200 OK Response</strong>
              <button
                type="button"
                className="custom-button btn-ghost btn-sm"
                onClick={() => { navigator.clipboard?.writeText(currentApi.sampleRes); showNotice("Đã sao chép Response JSON"); }}
              >
                Sao chép
              </button>
            </div>
            <pre style={{ margin: 0, padding: 12, background: "#171827", color: "#38bdf8", borderRadius: 8, fontSize: 13, overflowX: "auto", fontFamily: "var(--font-jakarta), monospace" }}>
              <code>{currentApi.sampleRes}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

function DeveloperSettings({ page, showNotice }: { page: "API keys" | "Direct URL" | "Webhooks"; showNotice: (message: string) => void }) {
  const [showSecret, setShowSecret] = useState(false);
  const [redirects, setRedirects] = useState(["https://app.bankhub.vn/cas/callback", "https://staging.bankhub.vn/cas/callback"]);
  const [webhooks, setWebhooks] = useState([
    { name: "Grant events", url: "https://api.bankhub.vn/cas/webhook", actions: ["GRANT"], status: "Active" },
    { name: "Transaction events", url: "https://api.bankhub.vn/cas/transactions", actions: ["TRANSACTION"], status: "Active" },
  ]);
  const [webhookModal, setWebhookModal] = useState(false);
  const [webhookDraft, setWebhookDraft] = useState({ name: "", description: "", url: "https://", actions: ["GRANT"], status: "Active" });

  function copyValue(value: string, label: string) {
    navigator.clipboard?.writeText(value);
    showNotice(`Đã sao chép ${label}`);
  }

  if (page === "API keys") {
    const clientId = "33d42bee-13b4-4f33-b528-51e958e065ae";
    const secret = "cas_live_sk_8F2KD91M_n7Qp4Xv2Rc9L";
    return <section className="developer-form">
      <div className="form-section">
        <div className="form-label"><h2>Client API</h2><p>Dùng Client ID để định danh App trong quá trình kết nối.</p></div>
        <CredentialBox
          value={clientId}
          label="Client ID"
          onCopy={() => copyValue(clientId, "Client ID")}
        />
      </div>
      <div className="form-section secret-section">
        <div className="form-label"><h2>API secret key</h2><p>Chỉ sử dụng secret ở phía server. Không đưa key vào mobile app hoặc frontend.</p></div>
        <div className="warning-box"><span>△</span><p>Không chia sẻ secret key. Nếu key bị lộ, hãy rotate ngay để vô hiệu hoá key cũ.</p></div>
        <CredentialBox
          value={secret}
          label="Secret key"
          showToggle
          isShowing={showSecret}
          onToggle={() => setShowSecret(!showSecret)}
          onCopy={() => copyValue(secret, "Secret key")}
          onRotate={() => showNotice("Secret key mới đã được tạo")}
          note="Tạo lúc 12/07/2026 · Sử dụng gần nhất 4 phút trước"
        />
      </div>
    </section>;
  }

  if (page === "Direct URL") {
    return <section className="developer-form">
      <div className="settings-intro"><h2>URL trả về sau khi cấp quyền</h2><p>CAS chỉ chuyển hướng end-user về các URL đã được khai báo tại đây. URL phải dùng HTTPS, ngoại trừ localhost khi phát triển.</p></div>
      <div className="url-list">{redirects.map((url, index) => <div className="url-row" key={`${url}-${index}`}><span>{index + 1}</span><input value={url} onChange={e => setRedirects(redirects.map((item, i) => i === index ? e.target.value : item))} /><button onClick={() => setRedirects(redirects.filter((_, i) => i !== index))}>Xoá</button></div>)}</div>
      <button className="outline-action" onClick={() => setRedirects([...redirects, "https://"])}>＋ Thêm URL mới</button>
      <div className="form-actions"><button onClick={() => setRedirects(["https://app.bankhub.vn/cas/callback", "https://staging.bankhub.vn/cas/callback"])}>Đặt lại</button><button className="save-button" onClick={() => showNotice(`Đã lưu ${redirects.length} callback URL`)}>Lưu thay đổi</button></div>
    </section>;
  }

  const webhookTypes = ["GRANT", "TRANSACTION", "QRPAY", "VIRTUAL_ACCOUNT", "INVOICE"];

  function addWebhook() {
    if (!webhookDraft.name.trim() || webhookDraft.url === "https://") {
      showNotice("Vui lòng nhập tên và endpoint URL");
      return;
    }
    setWebhooks([...webhooks, { name: webhookDraft.name, url: webhookDraft.url, actions: webhookDraft.actions, status: webhookDraft.status }]);
    setWebhookDraft({ name: "", description: "", url: "https://", actions: ["GRANT"], status: "Active" });
    setWebhookModal(false);
    showNotice("Đã thêm webhook");
  }

  return <section className="developer-form webhook-page">
    <div className="settings-intro webhook-intro"><div><h2>Webhook endpoints</h2><p>CAS gửi HTTP POST khi action phát sinh. QRPay và VirtualAccount cần webhook để cập nhật trạng thái bất đồng bộ.</p></div><button className="primary-button webhook-cta" onClick={() => setWebhookModal(true)}>＋ Thêm webhook</button></div>
    <div className="webhook-table-list">
      <div className="webhook-table-head"><span>Webhook</span><span>Endpoint</span><span>Actions</span><span>Trạng thái</span><span /></div>
      {webhooks.map((hook, index) => <div className="webhook-table-row" key={`${hook.name}-${index}`}>
        <div><strong>{hook.name}</strong><small>Cập nhật 2 phút trước</small></div>
        <code>{hook.url}</code>
        <div className="row-events"><span>{hook.actions[0]}</span></div>
        <div className="switch-cell"><button className={`webhook-switch ${hook.status === "Active" ? "active" : ""}`} aria-pressed={hook.status === "Active"} aria-label={`${hook.name}: ${hook.status}`} onClick={() => setWebhooks(webhooks.map((item, i) => i === index ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item))}><i /></button><span>{hook.status}</span></div>
        <div className="row-actions"><button onClick={() => showNotice(`Đã gửi test event tới ${hook.name}`)}>Test</button><button onClick={() => setWebhooks(webhooks.filter((_, i) => i !== index))}>Xoá</button></div>
      </div>)}
    </div>
    {webhooks.length === 0 && <div className="webhook-empty">Chưa có webhook endpoint. Bấm “Thêm webhook” để bắt đầu.</div>}

    {webhookModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setWebhookModal(false)}>
      <div className="webhook-modal" role="dialog" aria-modal="true" aria-labelledby="webhook-modal-title" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-heading"><div><h2 id="webhook-modal-title">Thêm webhook</h2><p>Nhập endpoint và chọn các action muốn nhận.</p></div><button onClick={() => setWebhookModal(false)}>×</button></div>
        <div className="modal-body">
          <label><span>Tên webhook *</span><input autoFocus value={webhookDraft.name} onChange={e => setWebhookDraft({ ...webhookDraft, name: e.target.value })} placeholder="Ví dụ: Production events" /></label>
          <label><span>Mô tả</span><textarea value={webhookDraft.description} onChange={e => setWebhookDraft({ ...webhookDraft, description: e.target.value })} placeholder="Webhook xử lý sự kiện production" /></label>
          <label><span>Endpoint URL *</span><input value={webhookDraft.url} onChange={e => setWebhookDraft({ ...webhookDraft, url: e.target.value })} placeholder="https://api.example.com/webhooks/cas" /></label>
          <label><span>Webhook type *</span><select value={webhookDraft.actions[0]} onChange={e => setWebhookDraft({ ...webhookDraft, actions: [e.target.value] })}>{webhookTypes.map(type => <option key={type}>{type}</option>)}</select><small>Mỗi webhook endpoint chỉ nhận một type.</small></label>
          <label className="status-select"><span>Trạng thái</span><select value={webhookDraft.status} onChange={e => setWebhookDraft({ ...webhookDraft, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
        </div>
        <div className="modal-actions"><button onClick={() => setWebhookModal(false)}>Huỷ</button><button className="save-button" onClick={addWebhook}>Thêm webhook</button></div>
      </div>
    </div>}
  </section>;
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
