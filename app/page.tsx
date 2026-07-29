"use client";

import { useMemo, useState, type CSSProperties } from "react";

type AppData = { id: string; name: string; short: string; color: string; environment: string };
type AnalyticsTab = "Connection" | "Transaction" | "Identity" | "Balance" | "QRPay" | "VirtualAccount" | "Transfer" | "eKYC" | "Invoice";
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

const apps: AppData[] = [
  { id: "app_8F2KD91M", name: "BankHub EKYC", short: "BE", color: "#6956d9", environment: "Production" },
  { id: "app_3H7NP24Q", name: "FinFlow Personal", short: "FP", color: "#16856f", environment: "Production" },
  { id: "app_9C1RT63V", name: "LendNow Sandbox", short: "LN", color: "#d9773b", environment: "Sandbox" },
];

const navGroups = [
  { label: "", items: [{ icon: "⌂", label: "Tổng quan" }] },
  { label: "DEVELOPER", items: [{ icon: "⌁", label: "API keys" }, { icon: "↗", label: "API" }, { icon: "◫", label: "Webhooks" }, { icon: "≡", label: "Logs" }] },
  { label: "HOẠT ĐỘNG", items: [{ icon: "◎", label: "Connections" }, { icon: "↗", label: "Usage" }, { icon: "◇", label: "Grant debugger" }] },
  { label: "CẤU HÌNH", items: [{ icon: "⚙", label: "Cài đặt App" }, { icon: "♙", label: "Thành viên" }] },
];

const baseRows: DetailRow[] = [
  { requestId: "req_8K2MP91N", grant: "grt_8L2KP91N", user: "Nguyễn Minh Anh", bank: "Techcombank", scopes: "Transaction · Balance · Identity", calls: "28,491", status: "Active", last: "2 phút trước", cost: "₫1,424,550", endpoint: "/v2/transactions", http: "200", latency: "284 ms" },
  { requestId: "req_4T7QD20A", grant: "grt_4T7MD20Q", user: "Trần Hoàng Long", bank: "Vietcombank", scopes: "Balance · QRPay · Transfer", calls: "18,420", status: "Active", last: "11 phút trước", cost: "₫921,000", endpoint: "/v2/balance", http: "200", latency: "326 ms" },
  { requestId: "req_1A9VC63F", grant: "grt_1A9HC63V", user: "Phạm Thùy Linh", bank: "MB Bank", scopes: "Identity · eKYC", calls: "12,708", status: "Paused", last: "36 phút trước", cost: "₫635,400", endpoint: "/v2/identity", http: "200", latency: "412 ms" },
  { requestId: "req_6P3RF82W", grant: "grt_6P3RF82K", user: "Đỗ Tuấn Nam", bank: "ACB", scopes: "VirtualAccount · Invoice", calls: "7,906", status: "Deleted", last: "Hôm qua", cost: "₫395,300", endpoint: "/v2/virtual-accounts", http: "429", latency: "602 ms" },
];

const scopeConfig: Record<Exclude<AnalyticsTab, "Connection">, { grants: string; costGrants: string; active: string; calls: string; cost: string; endpoints: string[]; price: number; webhook?: boolean }> = {
  Transaction: { grants: "2.416", costGrants: "750.000 VNĐ", active: "2.382", calls: "426.800", cost: "21.340.000", endpoints: ["/v2/transactions", "/v2/transactions/sync", "/v2/transactions/{id}"], price: 50 },
  Identity: { grants: "1.842", costGrants: "750.000 VNĐ", active: "1.806", calls: "204.100", cost: "12.250.000", endpoints: ["/v2/identity", "/v2/identity/profile", "/v2/accounts/owner"], price: 60 },
  Balance: { grants: "2.204", costGrants: "750.000 VNĐ", active: "2.171", calls: "281.400", cost: "9.850.000", endpoints: ["/v2/balance", "/v2/accounts", "/v2/accounts/{id}/balance"], price: 35 },
  QRPay: { grants: "986", costGrants: "750.000 VNĐ", active: "954", calls: "146.700", cost: "5.870.000", endpoints: ["/v2/qr/create", "/v2/qr/{id}", "/v2/qr/status"], price: 40, webhook: true },
  VirtualAccount: { grants: "742", costGrants: "750.000 VNĐ", active: "716", calls: "98.400", cost: "4.920.000", endpoints: ["/v2/virtual-accounts", "/v2/virtual-accounts/{id}", "/v2/virtual-accounts/transactions"], price: 50, webhook: true },
  Transfer: { grants: "1.126", costGrants: "750.000 VNĐ", active: "1.084", calls: "108.200", cost: "8.660.000", endpoints: ["/v2/transfers", "/v2/transfers/{id}", "/v2/transfers/confirm"], price: 80 },
  eKYC: { grants: "1.508", costGrants: "750.000 VNĐ", active: "1.492", calls: "176.500", cost: "14.120.000", endpoints: ["/v2/ekyc/sessions", "/v2/ekyc/verify", "/v2/ekyc/results/{id}"], price: 80 },
  Invoice: { grants: "624", costGrants: "750.000 VNĐ", active: "603", calls: "72.600", cost: "3.630.000", endpoints: ["/v2/invoices", "/v2/invoices/{id}", "/v2/invoices/search"], price: 50 },
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

const analyticsData: Record<AnalyticsTab, {
  subtitle: string;
  metrics: { label: string; value: string; change?: string; tone?: string }[];
  rows: DetailRow[];
  hasWebhook?: boolean;
}> = {
  Connection: {
    subtitle: "Tổng hợp Grant ID đã kết nối và các scope được cấp quyền",
    metrics: [
      { label: "Tổng Grant ID", value: "2.847" },
      { label: "Đang hoạt động · đến 31/07", value: "2.592" },
      { label: "Thêm mới trong tháng", value: "184" },
      { label: "Tạm dừng trong tháng", value: "14", tone: "warning" },
      { label: "Đã xoá trong tháng", value: "3", tone: "danger" },
    ],
    rows: baseRows,
  },
  ...Object.fromEntries((Object.keys(scopeConfig) as Exclude<AnalyticsTab, "Connection">[]).map(scope => {
    const config = scopeConfig[scope];
    return [scope, {
      subtitle: `${config.grants} Grant ID đang có quyền gọi API thuộc scope ${scope}`,
      metrics: scope === "QRPay"
        ? [
          { label: "Grant đang hoạt động", value: config.active, change: "+6.8%" },
          { label: "Thanh toán thành công", value: "132.400", change: "+8.6%" },
          { label: "Thông báo thành công", value: "131.900", change: "+8.2%" },
          { label: "Tổng tiền giao dịch", value: "12.486.750.000", change: "+10.4%" },
          { label: "Chi phí QR Pay", value: config.cost, change: "+8.9%" },
        ]
        : [
          { label: `Grant ${scope} đang hoạt động`, value: config.grants, change: "+6.8%" },
          { label: "Chi phí Grant", value: config.costGrants, change: "+4.2%" },
          { label: "API calls", value: config.calls, change: "+9.7%" },
          { label: `Chi phí ${scope}`, value: config.cost, change: "+8.9%" },
        ],
      rows: buildScopeRows(scope),
      hasWebhook: config.webhook,
    }];
  })) as Record<Exclude<AnalyticsTab, "Connection">, {
    subtitle: string;
    metrics: { label: string; value: string; change?: string; tone?: string }[];
    rows: DetailRow[];
    hasWebhook?: boolean;
  }>,
};

const screenData: Record<string, { description: string; action: string; columns: string[]; rows: string[][] }> = {
  "API keys": { description: "Client ID và Secret key dùng để xác thực App.", action: "Tìm hiểu thêm ↗", columns: [], rows: [] },
  API: { description: "Danh sách URL nhận kết quả sau khi end-user cấp quyền thành công.", action: "Tìm hiểu thêm ↗", columns: [], rows: [] },
  Webhooks: { description: "Endpoint nhận sự kiện Grant, Transaction, QRPay và VirtualAccount.", action: "＋ Thêm webhook", columns: [], rows: [] },
  Logs: { description: "Lịch sử request API và webhook của App.", action: "⇩ Export logs", columns: ["Request ID", "Endpoint / Event", "Scope", "Grant ID", "HTTP"], rows: [["req_7KQ2M91P", "/v2/transactions", "Transaction", "grt_8L2KP91N", "200"], ["req_4PX9D20A", "/v2/balance", "Balance", "grt_4T7MD20Q", "200"], ["wh_1MV3C84F", "payment.succeeded", "QRPay webhook", "grt_1A9HC63V", "200"], ["wh_8AB5R72W", "va.credited", "VirtualAccount webhook", "grt_6P3RF82K", "429"]] },
  Connections: { description: "Tổng hợp Grant ID, ngân hàng và các scope đã được cấp.", action: "＋ Tạo connection", columns: ["Grant ID", "End-user", "Ngân hàng", "Scopes được cấp", "Trạng thái"], rows: baseRows.map(r => [r.grant, r.user, r.bank, r.scopes, r.status]) },
  Usage: { description: "Theo dõi Grant, API usage và chi phí theo từng nghiệp vụ.", action: "⇩ Tải hoá đơn", columns: ["Scope", "Grant có quyền", "API calls", "Chi phí", "Trạng thái"], rows: (Object.keys(scopeConfig) as Exclude<AnalyticsTab, "Connection">[]).map(scope => [scope, scopeConfig[scope].grants, scopeConfig[scope].calls, scopeConfig[scope].cost, "Active"]) },
  "Grant debugger": { description: "Kiểm tra trạng thái và quyền của một Grant.", action: "Chạy kiểm tra", columns: ["Grant ID gần đây", "Ngân hàng", "Scopes", "Hết hạn", "Trạng thái"], rows: [["grt_8L2KP91N", "Techcombank", "identity, balance, transaction", "24/10/2026", "Healthy"], ["grt_4T7MD20Q", "Vietcombank", "balance, transaction", "02/11/2026", "Healthy"], ["grt_1A9HC63V", "MB Bank", "identity, qrpay", "28/07/2026", "Expiring"]] },
  "Cài đặt App": { description: "Thông tin và callback URL của App.", action: "Lưu thay đổi", columns: ["Cấu hình", "Giá trị", "Môi trường", "Cập nhật", "Trạng thái"], rows: [["App ID", "app_8F2KD91M", "—", "Không đổi", "Active"], ["Redirect URI", "bankhub.vn/cas/callback", "Production", "19/07/2026", "Verified"], ["Allowed origin", "https://bankhub.vn", "Production", "19/07/2026", "Verified"]] },
  "Thành viên": { description: "Quản lý quyền truy cập App.", action: "＋ Mời thành viên", columns: ["Thành viên", "Email", "Vai trò", "Truy cập gần nhất", "Trạng thái"], rows: [["Minh Nguyễn", "minh@vietfin.vn", "Owner", "Vừa xong", "Active"], ["Linh Phạm", "linh@vietfin.vn", "Developer", "2 giờ trước", "Active"], ["Huy Trần", "huy@vietfin.vn", "Analyst", "Hôm qua", "Active"]] },
};

const monthChartValues = [34, 39, 37, 45, 42, 49, 47, 52, 50, 57, 54, 61, 59, 64, 62, 69, 66, 72, 70, 76, 73, 81, 78, 84, 82, 88, 85, 91, 89, 94, 92];
const grantNewDaily = [3, 4, 3, 5, 4, 6, 5, 5, 4, 7, 5, 6, 5, 7, 5, 8, 6, 5, 7, 6, 8, 5, 7, 6, 9, 7, 6, 8, 7, 9, 6];
const grantPausedDeletedDaily = [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 1, 0, 1, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 1, 0];
const visibleUsageTabs: AnalyticsTab[] = ["Connection", "Transaction", "QRPay", "Transfer"];

function usageTabLabel(tab: AnalyticsTab) {
  return tab === "Connection" ? "Grant" : tab;
}

function KpiValue({ value }: { value: string }) {
  const isMoney = value.endsWith(" VNĐ");
  return <>{isMoney ? value.slice(0, -4) : value}{isMoney && <i className="kpi-currency">đ</i>}</>;
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
      ["5", "req_TRX83743", "grt_2K8NP14D", "BIDV", "2111 •••• 9024", "01/07/2026", "24/07/2026", "Success", "1s", "24/07/2026 13:45:09"],
      ["6", "req_TRX83606", "grt_9Q4LC73A", "Sacombank", "0602 •••• 2180", "23/07/2026", "24/07/2026", "Success", "2.4s", "24/07/2026 13:28:52"],
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
    ],
  },
  VirtualAccount: {
    title: "Danh sách tài khoản định danh",
    columns: ["VA ID", "Grant ID", "Số tài khoản VA", "Ngân hàng", "Chủ tài khoản", "Số dư", "Webhook gần nhất", "Trạng thái"],
    rows: [
      ["va_82JF91", "grt_6P3RF82K", "9868120001842", "ACB", "CTY TNHH NAM VIET", "₫18,420,000", "Delivered · 2 phút", "Active"],
      ["va_47MD20", "grt_9Q4LC73A", "9704360028471", "Vietcombank", "NOVA RETAIL JSC", "₫6,850,000", "Delivered · 8 phút", "Active"],
      ["va_19HC63", "grt_4T7MD20Q", "1903690015820", "Techcombank", "MINH LONG JSC", "₫42,100,000", "Retrying · 11 phút", "Paused"],
      ["va_63RF82", "grt_8L2KP91N", "1289100042763", "BIDV", "NGUYEN MINH ANH", "₫0", "—", "Inactive"],
    ],
  },
  Transfer: {
    title: "Lệnh chuyển tiền",
    columns: ["Transfer ID", "Grant ID", "Từ ngân hàng", "Người hưởng / Ngân hàng", "Số tiền", "Nội dung", "Trạng thái", "Ngày tạo"],
    rows: [
      ["trf_82MP91", "grt_2K8NP14D", "BIDV", "Nguyễn Minh Anh · TCB", "₫5,200,000", "Thanh toan HĐ 1842", "Success", "24/07 · 16:12"],
      ["trf_47QD20", "grt_8L2KP91N", "Techcombank", "Công ty Minh Long · VCB", "₫18,400,000", "Payment INV-841", "Processing", "24/07 · 15:48"],
      ["trf_19VC63", "grt_4T7MD20Q", "Vietcombank", "Trần Hoàng Long · BIDV", "₫2,100,000", "Hoàn ứng", "Failed", "24/07 · 15:07"],
      ["trf_63RF82", "grt_6P3RF82K", "ACB", "Nova Retail · STB", "₫32,500,000", "Đối soát 23/07", "Success", "24/07 · 14:33"],
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
  { requestId: "req_G1UZLSe4PO6m6qAa", method: "GET", endpoint: "/v2/identity", scope: "Identity", grantId: "grt_6P3RF82K", bank: "ACB", http: "401", latency: "198 ms", createdAt: "09:21:48 24/07/2026", requestBody: "{}", responseBody: "{\n  \"error\": {\n    \"code\": \"ACCESS_TOKEN_INVALID\",\n    \"message\": \"Access token is invalid or has been revoked\"\n  }\n}" },
  { requestId: "req_FNR6ALvSb1hzMZMC", method: "POST", endpoint: "/v2/qr/create", scope: "QRPay", grantId: "grt_8L2KP91N", bank: "Techcombank", http: "200", latency: "365 ms", createdAt: "09:21:42 24/07/2026", requestBody: "{\n  \"amount\": 125000,\n  \"description\": \"Order BH-10428\"\n}", responseBody: "{\n  \"data\": {\n    \"qrId\": \"qr_M20P81\",\n    \"status\": \"PENDING\",\n    \"expiredAt\": \"2026-07-24T09:36:42+07:00\"\n  }\n}" },
  { requestId: "req_d1S1tc-hYOtKNj6P", method: "POST", endpoint: "/grant/exchange", scope: "Grant", grantId: "grt_4T7MD20Q", bank: "Vietcombank", http: "429", latency: "602 ms", createdAt: "09:21:37 24/07/2026", requestBody: "{\n  \"publicToken\": \"pub_••••••••91Q\"\n}", responseBody: "{\n  \"error\": {\n    \"code\": \"RATE_LIMIT_EXCEEDED\",\n    \"message\": \"Too many requests. Please retry later\"\n  }\n}" },
  { requestId: "req_MV3C84FP9kQ2Ls71", method: "GET", endpoint: "/v2/virtual-accounts", scope: "VirtualAccount", grantId: "grt_6P3RF82K", bank: "ACB", http: "200", latency: "241 ms", createdAt: "08:56:11 24/07/2026", requestBody: "{\n  \"status\": \"ACTIVE\"\n}", responseBody: "{\n  \"data\": [{ \"id\": \"va_82JF91\", \"status\": \"ACTIVE\" }]\n}" },
  { requestId: "req_AB5R72WQ1xP4Nc90", method: "GET", endpoint: "/v2/invoices", scope: "Invoice", grantId: "grt_1A9HC63V", bank: "MB Bank", http: "500", latency: "814 ms", createdAt: "08:43:09 24/07/2026", requestBody: "{\n  \"month\": \"2026-07\"\n}", responseBody: "{\n  \"error\": {\n    \"code\": \"UPSTREAM_ERROR\",\n    \"message\": \"The financial institution is temporarily unavailable\"\n  }\n}" },
];

export default function Home() {
  const [selectedApp, setSelectedApp] = useState(apps[0]);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
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
  const [usageView, setUsageView] = useState<"Total" | AnalyticsTab>("Total");
  const [sidebarWidth, setSidebarWidth] = useState(286);
  const [resizingSidebar, setResizingSidebar] = useState(false);

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
  const isDeveloperPage = activeNav === "API keys" || activeNav === "API" || activeNav === "Webhooks";

  function showNotice(message: string) {
    setNotice(message);
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
        <div className="brand-row"><a className="brand" href="#"><span className="brand-mark"><i /><i /><i /></span><span>CAS</span></a><button className="sidebar-collapse" onClick={() => setMobileMenu(false)}>«</button></div>
        <div className="vendor-label">APP ĐANG CHỌN</div>
        <div className="app-switcher-wrap">
          <button className="app-switcher" onClick={() => setAppMenuOpen(!appMenuOpen)}><span className="app-avatar" style={{ background: selectedApp.color }}>{selectedApp.short}</span><span className="app-copy"><strong>{selectedApp.name}</strong><small>{selectedApp.id}</small></span><span className="switcher-chevrons">⌃<br />⌄</span></button>
          {appMenuOpen && <div className="app-menu"><div className="app-menu-heading"><span>Apps của VietFin Digital</span><button>＋ Tạo App</button></div>{apps.map(app => <button className={app.id === selectedApp.id ? "selected" : ""} key={app.id} onClick={() => { setSelectedApp(app); setAppMenuOpen(false); }}><span className="app-avatar" style={{ background: app.color }}>{app.short}</span><span><strong>{app.name}</strong><small>{app.environment} · {app.id}</small></span>{app.id === selectedApp.id && <b>✓</b>}</button>)}</div>}
        </div>
        <nav className="sidebar-nav">{navGroups.map((group, i) => <div className="nav-group" key={i}>{group.label && <p>{group.label}</p>}{group.items.map(item => <div className="nav-item-wrap" key={item.label}>
          <button className={activeNav === item.label ? "active" : ""} onClick={() => { if (item.label === "Usage") { if (activeNav === "Usage") setUsageExpanded(!usageExpanded); else { setActiveNav("Usage"); setUsageExpanded(true); } } else { setActiveNav(item.label); setMobileMenu(false); } }}><span>{item.icon}</span>{item.label}{item.label === "Usage" && <small className={`nav-arrow ${usageExpanded ? "open" : ""}`}>⌄</small>}</button>
          {item.label === "Usage" && usageExpanded && <div className="usage-subnav">
            <button className={activeNav === "Usage" && usageView === "Total" ? "active" : ""} onClick={() => { setActiveNav("Usage"); setUsageView("Total"); setMobileMenu(false); }}>Total</button>
            {visibleUsageTabs.map(tab => <button className={activeNav === "Usage" && usageView === tab ? "active" : ""} key={tab} onClick={() => { setActiveNav("Usage"); setUsageView(tab); setAnalyticsTab(tab); setSearch(""); setGrantFilter("Tất cả Grant"); setStatusFilter("Tất cả trạng thái"); setPage(1); setMobileMenu(false); }}>{usageTabLabel(tab)}</button>)}
          </div>}
        </div>)}</div>)}
          <div className="nav-group utility-nav">
            <button onClick={() => { showNotice("Đã mở tài liệu Cas"); setMobileMenu(false); }}><span>▤</span>Tài liệu</button>
            <button onClick={() => { showNotice("Đã mở trung tâm hỗ trợ"); setMobileMenu(false); }}><span>◉</span>Hỗ trợ</button>
          </div>
        </nav>
        <div className="sidebar-footer"><div className="vendor-profile"><span className="profile-avatar">VD</span><span><small>VENDOR</small><strong>VietFin Digital</strong></span><button>•••</button></div></div>
        <div className="sidebar-resizer" role="separator" aria-label="Thay đổi chiều rộng menu" aria-orientation="vertical" onPointerDown={e => { setResizingSidebar(true); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (resizingSidebar) setSidebarWidth(Math.min(390, Math.max(220, e.clientX))); }} onPointerUp={e => { setResizingSidebar(false); e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => setResizingSidebar(false)} />
      </aside>

      <div className="workspace">
        <header className="topbar"><button className="mobile-trigger" onClick={() => setMobileMenu(true)}>☰</button><div className="crumbs"><span>{selectedApp.name}</span><b>/</b><strong>{activeNav}</strong>{activeNav === "Usage" && <><b>/</b><strong>{usageView === "Connection" ? "Grant" : usageView}</strong></>}</div><div className="top-actions"><button className="status-pill"><i />Hệ thống ổn định</button><button className="icon-button">⌕</button><button className="language">VI⌄</button><span className="user-avatar">MN</span></div></header>
        <main className="main compact-main">
          {notice && <div className="toast"><span>✓</span>{notice}</div>}

          {activeNav === "Usage" ? (
            <>
              {usageView === "Total" ? <UsageTotal showNotice={showNotice} /> : <section className="panel compact-analytics usage-content">
                <div className={`compact-kpis ${analyticsTab === "Connection" || analyticsTab === "QRPay" ? "five-columns" : ""}`}>{analytics.metrics.map(metric => <div key={metric.label}><span>{metric.label}</span><strong><KpiValue value={metric.value} /></strong>{metric.change && <small className={metric.tone}>↗ {metric.change}</small>}</div>)}</div>
                <div className="wide-chart">
                  <div className="mini-chart-title"><span>{analyticsTab === "Connection" ? "Grant thêm mới theo ngày" : "Xu hướng API calls"} · 01/07–31/07/2026</span><div><i />{analyticsTab === "Connection" ? "Grant mới" : "API calls"} <i />{analyticsTab === "Connection" ? "Pause / Delete" : "Failed"}</div></div>
                  <div className="chart"><div className="y-axis">{analyticsTab === "Connection" ? <><span>10</span><span>7</span><span>4</span><span>0</span></> : <><span>60k</span><span>40k</span><span>20k</span><span>0</span></>}</div><div className="bars">{(analyticsTab === "Connection" ? grantNewDaily : monthChartValues).map((value, i) => {
                    const secondary = analyticsTab === "Connection" ? grantPausedDeletedDaily[i] : 3 + (i % 4);
                    return <div className="bar-slot" key={i}><span style={{ height: `${analyticsTab === "Connection" ? value * 10 : value}%` }} /><i style={{ height: `${analyticsTab === "Connection" ? secondary * 10 : secondary}%` }} /><small>{i + 1}</small><em className="chart-hover-card"><b>Ngày {i + 1}</b><span>{analyticsTab === "Connection" ? "Grant mới" : "API calls"}: {value}</span><span>{analyticsTab === "Connection" ? "Pause/Delete" : "Failed"}: {secondary}</span></em></div>;
                  })}</div></div>
                </div>

                <UsageRecordsTable key={analyticsTab} tab={analyticsTab} search={search} onSearch={setSearch} timeFilter={timeFilter} onTimeFilter={setTimeFilter} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} showNotice={showNotice} />
              </section>}
            </>
          ) : activeNav === "Tổng quan" ? <OnboardingScreen onNavigate={setActiveNav} showNotice={showNotice} /> : activeNav === "Logs" ? <LogsScreen showNotice={showNotice} /> : isDeveloperPage ? <DeveloperSettings page={activeNav as "API keys" | "API" | "Webhooks"} showNotice={showNotice} /> : <DataScreen data={screenData[activeNav]} showNotice={showNotice} />}
        </main>
      </div>
      {mobileMenu && <button className="backdrop" onClick={() => setMobileMenu(false)} />}
    </div>
  );
}

function UsageTotal({ showNotice }: { showNotice: (message: string) => void }) {
  const [paymentState, setPaymentState] = useState<"unpaid" | "scanning" | "paid">("unpaid");
  const billingRows = [
    ["Grant", "2,847 connections", "Miễn phí", "₫0"],
    ["Transaction", "426,800 calls", "₫50 / call", "₫21,340,000"],
    ["Balance", "281,400 calls", "₫35 / call", "₫9,849,000"],
    ["QRPay", "146,700 calls", "₫40 / call", "₫5,868,000"],
    ["Transfer", "108,200 calls", "₫80 / call", "₫8,656,000"],
  ];

  return <div className="usage-total">
    <section className="summary-strip usage-summary">
      <div><span>Tổng Grant</span><strong>2.847</strong><small>+8.4%</small></div>
      <div><span>Tổng API calls</span><strong>963.100</strong><small>+12.6%</small></div>
      <div><span>Tỷ lệ thành công</span><strong>99.72%</strong><small>Ổn định</small></div>
      <div><span>Cần thanh toán</span><strong><KpiValue value="50.284.300 VNĐ" /></strong><small>{paymentState === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</small></div>
    </section>
    <section className="total-billing-layout">
      <div className="panel billing-breakdown">
        <div className="total-section-heading"><div><h2>Chi phí theo dịch vụ</h2><p>Kỳ sử dụng 01/07–31/07/2026</p></div><select aria-label="Kỳ thanh toán"><option>Tháng 07/2026</option><option>Tháng 06/2026</option><option>Tháng 05/2026</option></select></div>
        <table><thead><tr><th>Dịch vụ</th><th>Sản lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{billingRows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>)}</tbody></table>
      </div>
      <aside className="panel invoice-summary">
        <div className="invoice-status-line"><span className="invoice-label">KỲ THANH TOÁN</span><span className={`invoice-payment-status ${paymentState}`}>{paymentState === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span></div>
        <h2>Tháng 07/2026</h2>
        <dl><div><dt>Tạm tính</dt><dd>₫45,713,000</dd></div><div><dt>Thuế VAT (10%)</dt><dd>₫4,571,300</dd></div><div className="invoice-total"><dt>Tổng thanh toán</dt><dd>₫50,284,300</dd></div></dl>
        <p>{paymentState === "paid" ? "Thanh toán thành công lúc 10:24 27/07/2026. Hoá đơn điện tử đã sẵn sàng." : "Thanh toán trước ngày 01/08/2026. Hoá đơn chỉ được phát hành sau khi giao dịch thành công."}</p>
        {paymentState === "paid"
          ? <button className="primary-button" onClick={() => showNotice("Đã xuất hoá đơn tháng 07/2026")}>⇩ Xuất hóa đơn</button>
          : <button className="primary-button payment-button" onClick={() => setPaymentState("scanning")}>Thanh toán ₫50,284,300</button>}
        <button className="invoice-secondary" onClick={() => showNotice("Đã mở lịch sử thanh toán")}>Xem lịch sử thanh toán</button>
      </aside>
    </section>
    {paymentState === "scanning" && <div className="payment-screen" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="payment-modal">
        <div className="payment-heading"><div><span>THANH TOÁN HOÁ ĐƠN</span><h2 id="payment-title">Quét mã QR để thanh toán</h2></div><button aria-label="Đóng" onClick={() => setPaymentState("unpaid")}>×</button></div>
        <div className="payment-content">
          <div className="payment-qr"><div className="qr-noise"><i /><i /><i /></div><small>VIETQR</small></div>
          <div className="payment-info">
            <span>SỐ TIỀN THANH TOÁN</span><strong>₫50,284,300</strong>
            <dl><div><dt>Ngân hàng</dt><dd>MB Bank</dd></div><div><dt>Người nhận</dt><dd>CAS VIETNAM JSC</dd></div><div><dt>Nội dung</dt><dd>CAS APP8F2 JUL2026</dd></div><div><dt>Hết hạn</dt><dd>14:59</dd></div></dl>
            <p>Mở ứng dụng ngân hàng, quét mã và giữ nguyên nội dung chuyển khoản.</p>
            <button className="primary-button" onClick={() => { setPaymentState("paid"); showNotice("Thanh toán thành công"); }}>Mô phỏng thanh toán thành công</button>
            <button onClick={() => setPaymentState("unpaid")}>Huỷ thanh toán</button>
          </div>
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
  function autoWidthFor(index: number) {
    const values = [data.columns[index], ...data.rows.map(row => row[index] ?? "")];
    const longest = Math.max(...values.map(value => String(value).length));
    const extra = data.columns[index] === "Ngân hàng" ? 54 : 32;
    const maximum = data.columns[index] === "Scope" ? 320 : 280;
    return Math.min(maximum, Math.max(data.columns[index] === "STT" ? 58 : 82, longest * 7 + extra));
  }
  const [columnWidths, setColumnWidths] = useState(() => data.columns.map((_, index) => autoWidthFor(index)));
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const filtered = data.rows.filter(row => row.join(" ").toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const statusValues = ["New", "Accepted", "Active", "Inactive", "Paused", "Deleted", "Success", "Failed", "Processing", "Paid", "Pending", "Expired", "Cancelled", "Verified", "Rejected", "Issued", "Delivered", "Retrying", "Chưa phát sinh"];
  const bankMarks: Record<string, string> = { Techcombank: "TCB", Vietcombank: "VCB", "MB Bank": "MB", ACB: "ACB", BIDV: "BIDV", Sacombank: "STB" };

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
        <select className="table-month-filter" value={timeFilter} onChange={e => { onTimeFilter(e.target.value); setPage(1); }} aria-label="Tháng dữ liệu"><option>Tháng 07/2026</option><option>Tháng 06/2026</option><option>Tháng 05/2026</option></select>
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
              : data.columns[cellIndex] === "Ngân hàng"
                ? <span className="bank-name"><i className={`bank-mark bank-${cell.toLowerCase().replaceAll(" ", "-")}`}>{bankMarks[cell] ?? cell.slice(0, 2).toUpperCase()}</i>{cell}</span>
                : data.columns[cellIndex].includes("ID")
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

function LogsScreen({ showNotice }: { showNotice: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState("Tất cả API routes");
  const [responseCode, setResponseCode] = useState("Tất cả response");
  const [timeRange, setTimeRange] = useState("7 ngày qua");
  const [bank, setBank] = useState("Tất cả ngân hàng");
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [detailTab, setDetailTab] = useState<"request" | "response">("request");
  const [page, setPage] = useState(1);

  const filtered = logRecords.filter(log => {
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
        <select value={route} onChange={e => { setRoute(e.target.value); setPage(1); }} aria-label="API routes"><option>Tất cả API routes</option>{[...new Set(logRecords.map(log => log.endpoint))].map(item => <option key={item}>{item}</option>)}</select>
        <select value={responseCode} onChange={e => { setResponseCode(e.target.value); setPage(1); }} aria-label="Response code"><option>Tất cả response</option><option>2xx Thành công</option><option>4xx / 5xx Lỗi</option></select>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} aria-label="Thời gian"><option>24 giờ qua</option><option>7 ngày qua</option><option>30 ngày qua</option></select>
        <select value={bank} onChange={e => { setBank(e.target.value); setPage(1); }} aria-label="Ngân hàng"><option>Tất cả ngân hàng</option>{[...new Set(logRecords.map(log => log.bank))].map(item => <option key={item}>{item}</option>)}</select>
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

function OnboardingScreen({ onNavigate, showNotice }: { onNavigate: (page: string) => void; showNotice: (message: string) => void }) {
  const [activeStep, setActiveStep] = useState(1);
  const steps = [
    { title: "Lấy API credentials", note: "Client ID và Secret key", done: true },
    { title: "Cấu hình callback URL", note: "URL nhận publicToken", done: true },
    { title: "Tạo grantToken", note: "POST /grant/token", done: false },
    { title: "Mở Cas Link", note: "End-user kết nối ngân hàng", done: false },
    { title: "Đổi publicToken", note: "POST /grant/exchange", done: false },
    { title: "Gọi API đầu tiên", note: "Theo scope của Grant", done: false },
  ];

  const content = [
    { title: "Lấy Client ID và Secret key", text: "Dùng credentials của App để xác thực request server-to-server. Bắt đầu bằng môi trường Sandbox.", code: "x-client-id: <CLIENT_ID>\nx-secret-key: <SECRET_KEY>", action: "Mở API keys", page: "API keys" },
    { title: "Khai báo URL trả về", text: "Sau khi end-user liên kết thành công, Cas chuyển hướng về callback URL và trả publicToken tạm thời.", code: "https://app.bankhub.vn/cas/callback", action: "Cấu hình callback", page: "API" },
    { title: "Tạo grantToken với scope cần dùng", text: "Chỉ yêu cầu các scope cần thiết. grantToken có hiệu lực 30 phút và chỉ dùng một lần.", code: "POST https://sandbox.bankhub.dev/grant/token\n\n{\n  \"scopes\": \"identity,transaction\",\n  \"language\": \"vi\",\n  \"redirectUri\": \"https://app.bankhub.vn/cas/callback\"\n}", action: "Đã hiểu, tiếp tục", page: "" },
    { title: "Mở Cas Link cho end-user", text: "Truyền grantToken vào Cas Link. End-user chọn ngân hàng, đăng nhập và cấp quyền cho các scope đã yêu cầu.", code: "Cas Link → grantToken → publicToken", action: "Xem tài liệu Cas Link", page: "" },
    { title: "Đổi publicToken lấy accessToken", text: "Thực hiện ở server. Response trả về accessToken và grantId; hãy lưu accessToken an toàn.", code: "POST https://sandbox.bankhub.dev/grant/exchange\n\n{\n  \"publicToken\": \"<PUBLIC_TOKEN>\"\n}", action: "Đã hiểu, tiếp tục", page: "" },
    { title: "Gọi API thuộc scope của Grant", text: "Dùng accessToken để gọi endpoint tương ứng. Ví dụ dưới đây cần Grant có scope identity.", code: "GET https://sandbox.bankhub.dev/identity\nAuthorization: <ACCESS_TOKEN>\nx-client-id: <CLIENT_ID>\nx-secret-key: <SECRET_KEY>", action: "Đánh dấu hoàn tất", page: "" },
  ][activeStep - 1];

  return <div className="onboarding-layout">
    <section className="onboarding-welcome">
      <div><span className="guide-eyebrow">QUICK START</span><h2>Gọi API Cas đầu tiên</h2><p>Đi từ credentials đến một Grant có thể gọi API trong khoảng vài bước.</p></div>
      <a href="https://cas.so/quickstart/" target="_blank" rel="noreferrer">Mở tài liệu đầy đủ ↗</a>
    </section>
    <div className="onboarding-progress"><div><span>Tiến độ tích hợp</span><strong>2 / 6 bước</strong></div><i><b style={{ width: "33.33%" }} /></i></div>
    <section className="guide-shell">
      <nav className="guide-steps" aria-label="Các bước tích hợp">
        {steps.map((step, index) => <button className={activeStep === index + 1 ? "active" : ""} key={step.title} onClick={() => setActiveStep(index + 1)}><span className={step.done ? "done" : ""}>{step.done ? "✓" : index + 1}</span><div><strong>{step.title}</strong><small>{step.note}</small></div></button>)}
      </nav>
      <article className="guide-content">
        <div className="guide-step-label">BƯỚC {activeStep} / 6</div>
        <h3>{content.title}</h3>
        <p>{content.text}</p>
        <pre><code>{content.code}</code><button onClick={() => { navigator.clipboard?.writeText(content.code); showNotice("Đã sao chép đoạn mã"); }}>Sao chép</button></pre>
        <div className="guide-actions">
          {activeStep > 1 && <button onClick={() => setActiveStep(activeStep - 1)}>← Quay lại</button>}
          <button className="guide-primary" onClick={() => content.page ? onNavigate(content.page) : activeStep < 6 ? setActiveStep(activeStep + 1) : showNotice("Onboarding đã hoàn tất")}>{content.action}</button>
        </div>
      </article>
    </section>
    <div className="sandbox-note"><span>i</span><div><strong>Nên bắt đầu với Sandbox</strong><p>Dùng endpoint <code>https://sandbox.bankhub.dev</code> và dữ liệu test trước khi chuyển sang Production.</p></div></div>
  </div>;
}

function DeveloperSettings({ page, showNotice }: { page: "API keys" | "API" | "Webhooks"; showNotice: (message: string) => void }) {
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
      <div className="form-section"><div className="form-label"><h2>Client API</h2><p>Dùng Client ID để định danh App trong quá trình kết nối.</p></div><div className="credential-field"><code>{clientId}</code><button onClick={() => copyValue(clientId, "Client ID")}>▣ Sao chép</button></div></div>
      <div className="form-section secret-section"><div className="form-label"><h2>API secret key</h2><p>Chỉ sử dụng secret ở phía server. Không đưa key vào mobile app hoặc frontend.</p></div><div className="warning-box"><span>△</span><p>Không chia sẻ secret key. Nếu key bị lộ, hãy rotate ngay để vô hiệu hoá key cũ.</p></div><div className="credential-field"><code>{showSecret ? secret : "••••••••••••••••••••••••••••••••"}</code><button onClick={() => setShowSecret(!showSecret)}>{showSecret ? "Ẩn" : "Hiện"}</button><button onClick={() => copyValue(secret, "Secret key")}>▣ Sao chép</button><button onClick={() => showNotice("Secret key mới đã được tạo")}>↻ Rotate</button></div><small className="field-note">Tạo lúc 12/07/2026 · Sử dụng gần nhất 4 phút trước</small></div>
    </section>;
  }

  if (page === "API") {
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
