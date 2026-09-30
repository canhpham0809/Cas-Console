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
// The icons below are the real per-product hero icons pulled straight from
// https://cas.so/product/<slug>/, recolored (currentColor + translucent
// white badge) to read well on the dark showcase background.
function ProductIcon({ html }: { html: string }) {
  // eslint-disable-next-line react/no-danger
  return <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="none" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: html }} />;
}
function IconVirtualAccount() {
  // https://cas.so/product/virtual-account/
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="M14.466 11.24c.712.42.712 1.1 0 1.52l-8.355 4.923C4.963 18.36 3 17.881 3 16.924V7.076c0-.957 1.963-1.436 3.11-.76z"/><path fill="currentColor" fill-rule="evenodd" d="M21 12c0-.7-.37-1.333-.968-1.77L10.98 3.622c-.929-.679-2.127-.749-3.066-.465C6.998 3.434 6 4.178 6 5.391V18.61c0 1.213.998 1.957 1.914 2.234.939.284 2.137.213 3.066-.465l9.052-6.608C20.63 13.333 21 12.7 21 12m-2 0c0 .038-.016.143-.189.269L9.76 18.878c-.314.23-.8.292-1.236.16-.458-.139-.523-.358-.523-.43V5.392c0-.071.065-.29.523-.429.435-.132.922-.07 1.236.16l9.052 6.61c.173.126.189.23.189.268" clip-rule="evenodd"/>'} />;
}
function IconQrPay() {
  // https://cas.so/product/qr-pay/
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="M5.53 3.098C5.53 2.492 6.02 2 6.626 2h14.275C21.508 2 22 2.492 22 3.098v14.274c0 .607-.492 1.099-1.098 1.099H6.627a1.1 1.1 0 0 1-1.098-1.099z"/><path fill="currentColor" fill-rule="evenodd" d="M2 6.149c0-1.642 1.405-2.973 3.137-2.973h2.147a.99.99 0 1 1 0 1.981H5.137c-.577 0-1.045.444-1.045.992v12.879c0 .547.468.99 1.045.99h5.284a.99.99 0 0 1 0 1.981H5.137C3.405 22.001 2 20.67 2 19.029zM20.824 6.149c0-1.642-1.23-2.973-2.746-2.973h-1.754a.99.99 0 0 0 0 1.981h1.754c.506 0 .916.444.916.992v12.879c0 .547-.41.99-.916.99h-4.5a.99.99 0 0 0 0 1.981h4.5c1.517.001 2.746-1.33 2.746-2.971z" clip-rule="evenodd"/>'} />;
}
function IconEkyc() {
  // https://cas.so/product/ekyc/ (also used by IDKit)
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="M10.735 10.534a1.767 1.767 0 0 1 2.53 0l8.207 8.356c1.128 1.147.33 3.11-1.265 3.11H3.793C2.2 22 1.4 20.037 2.528 18.89z"/><path fill="currentColor" fill-rule="evenodd" d="M12 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10M5 9a7 7 0 1 1 14 0A7 7 0 0 1 5 9" clip-rule="evenodd"/>'} />;
}
function IconTransactions() {
  // https://cas.so/product/transactions/
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="m8.03 10.666 5.472-5.821a1.7 1.7 0 0 1 2.507 0l5.472 5.821a1.973 1.973 0 0 1 0 2.668l-5.472 5.821a1.7 1.7 0 0 1-2.508 0L8.03 13.334a1.973 1.973 0 0 1 0-2.668"/><path fill="currentColor" fill-rule="evenodd" d="M8.959 6.682a.84.84 0 0 1 .512-.174c.803 0 1.152 1.017.518 1.51l-2.77 2.151h8.374a.915.915 0 0 1 0 1.83H2.81a.274.274 0 0 1-.166-.491zM10.328 18.234a.84.84 0 0 1-.512.173c-.804 0-1.152-1.017-.518-1.51l2.77-2.151H3.694a.915.915 0 0 1 0-1.83h12.783c.262 0 .374.332.166.491z" clip-rule="evenodd"/>'} />;
}
function IconBalanceHook() {
  // https://cas.so/product/balance-hook/
  return <ProductIcon html={'<ellipse cx="13" cy="12.5" fill="rgba(255,255,255,.16)" rx="8" ry="7.5"/><path fill="currentColor" d="M7.422 20.5v-1.635q-1.335-.108-2.184-.58-.83-.473-1.3-1.109a4.5 4.5 0 0 1-.667-1.235 7 7 0 0 1-.235-1.017L3 14.506h2.076l.036.345q.054.327.253.8.216.472.704.89.488.4 1.353.544v-4.413l-.09-.018a10.3 10.3 0 0 1-2.003-.672 3.7 3.7 0 0 1-1.426-1.144q-.525-.746-.524-1.907 0-1.144.56-1.962a3.94 3.94 0 0 1 1.48-1.29 5.6 5.6 0 0 1 2.003-.58V3.5h1.426v1.635q1.155.144 1.896.58t1.155 1q.434.562.632 1.108.198.525.252.89l.055.345H10.78l-.054-.273a2.3 2.3 0 0 0-.217-.654 2.3 2.3 0 0 0-.578-.726q-.396-.345-1.083-.527v4.16l.163.036q.685.163 1.39.4.704.236 1.281.653.595.4.957 1.072.36.654.361 1.689 0 1.071-.541 1.925a4.1 4.1 0 0 1-1.463 1.399q-.937.526-2.148.653V20.5zM5.401 8.876q0 .708.487 1.144.487.418 1.534.69V6.825q-.938.146-1.48.726a1.85 1.85 0 0 0-.541 1.326m5.56 6.03q0-.836-.56-1.253-.559-.419-1.553-.672v4.105q.921-.165 1.517-.745.595-.582.595-1.435"/>'} />;
}
function IconPercent() {
  // https://cas.so/product/invoice-hub/ (also used by TVAN)
  return <ProductIcon html={'<circle cx="13.765" cy="11.318" r="8.235" fill="rgba(255,255,255,.16)"/><path fill="currentColor" d="M5.256 12.861q-1.053 0-1.788-.433a3.04 3.04 0 0 1-1.092-1.167A3.2 3.2 0 0 1 2 9.736q0-.81.376-1.524.376-.716 1.092-1.148.735-.453 1.788-.452 1.035 0 1.751.452.734.431 1.092 1.148.375.716.376 1.524 0 .81-.376 1.525a2.86 2.86 0 0 1-1.092 1.167q-.715.433-1.75.433m-1.11 7.868L12.108 6.8h2.466L6.612 20.73zm1.092-9.675q.583 0 .903-.395.339-.396.339-.904 0-.527-.339-.922-.32-.395-.903-.395-.603 0-.923.395-.32.394-.32.922 0 .509.32.904t.923.395m8.244 9.864q-1.053 0-1.788-.433a3.04 3.04 0 0 1-1.092-1.167 3.26 3.26 0 0 1-.376-1.544q0-.81.376-1.506.377-.716 1.092-1.148.735-.452 1.788-.452 1.054 0 1.77.452.715.433 1.091 1.148.377.697.377 1.506 0 .828-.377 1.544a3.04 3.04 0 0 1-1.091 1.167q-.715.433-1.77.433m-.018-1.807q.602 0 .922-.396.32-.394.32-.922 0-.508-.32-.904-.32-.395-.922-.395-.584 0-.923.395-.32.396-.32.904 0 .527.32.922.34.396.922.396"/>'} />;
}
// Reusable "lookup" magnifier glyph (evenodd ring + handle), same fill-only
// technique cas.so uses for its own product icons — appended to the custom
// icons below that don't have a real cas.so asset yet.
const lookupGlyph = '<circle cx="16.8" cy="16.8" r="2.9" fill="none" stroke="currentColor" stroke-width="1.7"/><line x1="18.9" y1="18.9" x2="21.6" y2="21.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';

function IconInvoiceLookup() {
  // custom — styled to match the cas.so product icons (translucent badge + solid currentColor glyph)
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="M5 2h9l5 5v15H5z"/><rect x="7.5" y="8.3" width="7" height="1.7" rx="0.85" fill="currentColor"/><rect x="7.5" y="11.6" width="7" height="1.7" rx="0.85" fill="currentColor"/><rect x="7.5" y="14.9" width="4" height="1.7" rx="0.85" fill="currentColor"/>' + lookupGlyph} />;
}
function IconETax() {
  // custom — styled to match the cas.so product icons (translucent badge + solid currentColor glyph)
  return <ProductIcon html={'<circle cx="12" cy="12" r="9.5" fill="rgba(255,255,255,.16)"/><rect x="7" y="13" width="2.4" height="5" rx="1" fill="currentColor"/><rect x="10.8" y="9.5" width="2.4" height="8.5" rx="1" fill="currentColor"/><rect x="14.6" y="6" width="2.4" height="12" rx="1" fill="currentColor"/>'} />;
}
function IconPayOut() {
  // https://cas.so/product/pay-out/ (also used by Payment Initiation)
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="M9.534 11.24c-.712.42-.712 1.1 0 1.52l8.356 4.923c1.147.677 3.11.198 3.11-.759V7.076c0-.957-1.963-1.436-3.11-.76z"/><path fill="currentColor" fill-rule="evenodd" d="M3 12c0-.7.37-1.333.968-1.77l9.052-6.608c.929-.679 2.127-.749 3.066-.465C17.002 3.434 18 4.178 18 5.391V18.61c0 1.213-.998 1.957-1.915 2.234-.938.284-2.136.213-3.065-.465L3.968 13.77C3.37 13.333 3 12.7 3 12m2 0c0 .038.016.143.189.269l9.052 6.609c.314.23.8.292 1.236.16.458-.139.523-.358.523-.43V5.392c0-.071-.065-.29-.523-.429-.435-.132-.922-.07-1.236.16l-9.052 6.61c-.173.126-.189.23-.189.268" clip-rule="evenodd"/>'} />;
}
function IconMstLookup() {
  // custom — styled to match the cas.so product icons (translucent badge + solid currentColor glyph)
  return <ProductIcon html={'<rect x="2" y="4.5" width="14.5" height="11" rx="2" fill="rgba(255,255,255,.16)"/><rect x="4.5" y="8" width="9.5" height="1.6" rx="0.8" fill="currentColor"/><rect x="4.5" y="11" width="6" height="1.6" rx="0.8" fill="currentColor"/>' + lookupGlyph} />;
}
function IconTaxpayerLookup() {
  // custom — styled to match the cas.so product icons (translucent badge + solid currentColor glyph)
  return <ProductIcon html={'<circle cx="9.5" cy="12" r="9" fill="rgba(255,255,255,.16)"/><circle cx="9.5" cy="8.2" r="2.7" fill="currentColor"/><path fill="currentColor" fill-rule="evenodd" d="M9.5 12.2c-3 0-5.4 2-5.4 4.6v1.1a9 9 0 0 0 10.8 0v-1.1c0-2.6-2.4-4.6-5.4-4.6z" clip-rule="evenodd"/>' + lookupGlyph} />;
}
function IconAccountLookup() {
  // custom — styled to match the cas.so product icons (translucent badge + solid currentColor glyph)
  return <ProductIcon html={'<rect x="1.5" y="5" width="15" height="11" rx="2.5" fill="rgba(255,255,255,.16)"/><rect x="1.5" y="8.5" width="15" height="2.3" fill="currentColor"/><rect x="4" y="12.5" width="4.5" height="1.6" rx="0.8" fill="currentColor"/>' + lookupGlyph} />;
}
function IconDeeplink() {
  // https://cas.so/product/deeplink/
  return <ProductIcon html={'<path fill="rgba(255,255,255,.16)" d="M9 9.733C9 9.328 9.328 9 9.733 9h9.534c.405 0 .733.328.733.733v9.534a.733.733 0 0 1-.733.733H9.733A.733.733 0 0 1 9 19.267z"/><path fill="currentColor" d="M3 1c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h11c1.11 0 2-.89 2-2v-3h-2v3H3V3h11v2h2V3c0-1.11-.89-2-2-2M9 7c-1.11 0-2 .89-2 2v3h2V9h11v11H9v-2H7v2c0 1.11.89 2 2 2h11c1.11 0 2-.89 2-2V9c0-1.11-.89-2-2-2z"/>'} />;
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
      { icon: IconPayOut, vi: "Payment Initiation", en: "Payment Initiation", descVi: "Lập lệnh cần duyệt", descEn: "Create orders pending approval" },
    ],
  },
  {
    title: { vi: "KẾ TOÁN", en: "ACCOUNTING" },
    items: [
      { icon: IconPercent, vi: "Invoice Hub", en: "Invoice Hub", descVi: "Tạo hoá đơn điện tử", descEn: "Generate e-invoices" },
      { icon: IconInvoiceLookup, vi: "Invoice", en: "Invoice", descVi: "Tra cứu hoá đơn", descEn: "Look up invoices" },
      { icon: IconPercent, vi: "TVAN", en: "TVAN", descVi: "Phát hành hoá đơn", descEn: "Issue e-invoices" },
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
