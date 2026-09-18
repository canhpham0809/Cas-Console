"use client";

export type Lang = "vi" | "en";

// ── Field / trust icons (shared by login & signup forms) ─────────────
export function IconMail() {
  return <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4 7.5 12 13l8-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function IconLock() {
  return <svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
export function IconShield() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.2c0 4.4-2.9 7.9-7 9.8-4.1-1.9-7-5.4-7-9.8V6l7-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9.2 12.1l2 2 3.6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function IconBadgeCheck() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5 14 5l2.6-.4 1 2.4 2.4 1-.4 2.6L21 12l-1.4 2.4.4 2.6-2.4 1-1 2.4L14 19l-2 1.5-2-1.5-2.6.4-1-2.4-2.4-1 .4-2.6L3 12l1.4-2.4-.4-2.6 2.4-1 1-2.4L10 5l2-1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M9 12.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function IconUser() {
  return <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
export function IconPhone() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M6.5 3.5h3l1.3 4-2 1.4a11 11 0 0 0 4.3 4.3l1.4-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

// ── Brand / language topbar ───────────────────────────────────────────
export function LoginTopbar({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="login-topbar">
      <a className="login-brand" href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cas-logo.png`} alt="CAS" className="login-brand-logo" />
        <span className="login-sandbox-tag">SANDBOX</span>
      </a>
      <div className="login-lang-toggle" role="group" aria-label="Ngôn ngữ">
        <button type="button" className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")} aria-label="Tiếng Việt">🇻🇳</button>
        <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} aria-label="English">🇬🇧</button>
      </div>
    </div>
  );
}

// ── Service showcase panel (right-hand brand / product list) ────────
function IconVirtualAccount() {
  return <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M9 9v6l6-3-6-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
function IconQrPay() {
  return <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="15" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /><path d="M15 15h3M15 19h6M20 15v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function IconEkyc() {
  return <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function IconTransactions() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M4 9h13M13 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 15H7M11 11l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconBalanceHook() {
  return <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7v10M14.5 9.3c0-1-1-1.8-2.5-1.8s-2.5.9-2.5 2 1 1.6 2.5 1.9 2.5.9 2.5 2-1.1 2-2.5 2-2.5-.7-2.5-1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function IconInvoice() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M6 3h9l3 3v15H6V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function IconInvoiceLookup() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M5 3h8l3 3v11H5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 8h5M8 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="16.5" cy="16.5" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M18.7 18.7 21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function IconETax() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M3 20h18M4 20V10l8-5 8 5v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
function IconPayOut() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 12)" /></svg>;
}
function IconPaymentInitiation() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M6 3h9l3 3v15H6V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="16" cy="17" r="4.2" fill="#171827" stroke="currentColor" strokeWidth="1.4" /><path d="M14.3 17l1.2 1.2 2.2-2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconMstLookup() {
  return <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M6.5 10h7M6.5 13h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="17.5" cy="17.5" r="3" fill="#171827" stroke="currentColor" strokeWidth="1.4" /><path d="M19.6 19.6 21.5 21.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function IconTaxpayerLookup() {
  return <svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 19c0-3.3 2.6-5.5 5.5-5.5s5.5 2.2 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="18" cy="17.5" r="3" fill="#171827" stroke="currentColor" strokeWidth="1.4" /><path d="M20.1 19.6 22 21.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function IconAccountLookup() {
  return <svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="15" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M2.5 9h15" stroke="currentColor" strokeWidth="1.5" /><path d="M5.5 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="17.8" cy="17.8" r="3" fill="#171827" stroke="currentColor" strokeWidth="1.4" /><path d="M19.9 19.9 21.8 21.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function IconDeeplink() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M10 14 14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M8.5 15.8 6.7 17.6a3 3 0 0 1-4.2-4.2l2.3-2.3a3 3 0 0 1 4.2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15.5 8.2 17.3 6.4a3 3 0 0 1 4.2 4.2l-2.3 2.3a3 3 0 0 1-4.2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const serviceGroups: { title: { vi: string; en: string }; items: { icon: () => React.JSX.Element; vi: string; en: string; descVi: string; descEn: string }[] }[] = [
  {
    title: { vi: "THANH TOÁN", en: "PAYMENTS" },
    items: [
      { icon: IconVirtualAccount, vi: "Virtual Account", en: "Virtual Account", descVi: "Tạo tài khoản ảo", descEn: "Generate virtual accounts" },
      { icon: IconQrPay, vi: "QR Pay", en: "QR Pay", descVi: "Tạo mã thanh toán", descEn: "Generate payment QR codes" },
    ],
  },
  {
    title: { vi: "PHÂN TÍCH & BÁO CÁO", en: "ANALYTICS & REPORTING" },
    items: [
      { icon: IconTransactions, vi: "Transactions", en: "Transactions", descVi: "Lịch sử giao dịch", descEn: "Transaction history" },
      { icon: IconBalanceHook, vi: "Balance Hook", en: "Balance Hook", descVi: "Biến động số dư", descEn: "Balance change notifications" },
    ],
  },
  {
    title: { vi: "CHUYỂN TIỀN", en: "TRANSFERS" },
    items: [
      { icon: IconPayOut, vi: "Pay Out", en: "Pay Out", descVi: "Chi hộ", descEn: "Initiate transfer orders via API" },
      { icon: IconPaymentInitiation, vi: "Payment Initiation", en: "Payment Initiation", descVi: "Lập lệnh cần duyệt", descEn: "Create orders pending approval" },
    ],
  },
  {
    title: { vi: "KẾ TOÁN", en: "ACCOUNTING" },
    items: [
      { icon: IconInvoice, vi: "Invoice Hub", en: "Invoice Hub", descVi: "Tạo hoá đơn điện tử", descEn: "Generate e-invoices" },
      { icon: IconInvoiceLookup, vi: "Invoice", en: "Invoice", descVi: "Tra cứu hoá đơn", descEn: "Look up invoices" },
      { icon: IconETax, vi: "eTax", en: "eTax", descVi: "Tra cứu báo cáo kinh doanh", descEn: "Look up business reports" },
    ],
  },
  {
    title: { vi: "ĐỊNH DANH", en: "IDENTITY" },
    items: [
      { icon: IconEkyc, vi: "EKYC", en: "EKYC", descVi: "Xác thực định danh người dùng", descEn: "Verify user identity" },
      { icon: IconMstLookup, vi: "Tra cứu MST DN", en: "Tax code lookup", descVi: "Tra cứu MST Danh nghiệp", descEn: "Look up tax codes" },
      { icon: IconTaxpayerLookup, vi: "Tra cứu MST HKD", en: "Taxpayer lookup", descVi: "Tra cứu người nộp thuế", descEn: "Look up taxpayer info" },
    ],
  },
  {
    title: { vi: "TIỆN ÍCH", en: "UTILITIES" },
    items: [
      { icon: IconAccountLookup, vi: "Tra cứu số tài khoản", en: "Account number lookup", descVi: "Tra cứu số tài khoản", descEn: "Look up account numbers" },
      { icon: IconDeeplink, vi: "Deeplink", en: "Deeplink", descVi: "Truy cập nhanh app ngân hàng", descEn: "Deep link straight into banking apps" },
    ],
  },
];

export function ServiceShowcase({ lang, tag, headline, lede }: { lang: Lang; tag: string; headline: string; lede: string }) {
  return (
    <aside className="login-showcase">
      <span className="login-showcase-tag">● {tag}</span>
      <h2>{headline}</h2>
      <p className="lede">{lede}</p>

      <div className="login-service-groups">
        {serviceGroups.map(group => (
          <div key={group.title.vi}>
            <p className="login-service-group-title">{group.title[lang]}</p>
            <div className="login-service-list">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <div className="login-service-item" key={item.vi}>
                    <span className="login-service-icon"><Icon /></span>
                    <span className="login-service-text">
                      <strong>{item[lang]}</strong>
                      <span>{lang === "vi" ? item.descVi : item.descEn}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
