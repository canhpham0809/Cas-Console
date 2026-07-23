"use client";

import { useMemo, useState } from "react";

const services = [
  { code: "TX", name: "Transactions", requests: "426.8k", rate: "99.81%", value: 426800 },
  { code: "BA", name: "Balance", requests: "281.4k", rate: "99.92%", value: 281400 },
  { code: "ID", name: "Identity", requests: "204.1k", rate: "99.88%", value: 204100 },
  { code: "QR", name: "QR Pay", requests: "146.7k", rate: "99.61%", value: 146700 },
  { code: "TR", name: "Transfer", requests: "108.2k", rate: "99.43%", value: 108200 },
  { code: "PI", name: "Payment Initiation", requests: "73.5k", rate: "99.37%", value: 73500 },
  { code: "VA", name: "Virtual Account", requests: "39.3k", rate: "99.76%", value: 39300 },
];

const connections = [
  { id: "con_7PQ8K3N2", initials: "NA", user: "Nguyễn Minh Anh", bank: "Techcombank", apis: ["ID", "BA", "TX", "TR"], requests: "14,892", activity: "2 phút trước", status: "Active" },
  { id: "con_2MD9J5L7", initials: "TL", user: "Trần Hoàng Long", bank: "Vietcombank", apis: ["BA", "TX", "QR"], requests: "8,421", activity: "11 phút trước", status: "Active" },
  { id: "con_6AV3C8R1", initials: "PL", user: "Phạm Thùy Linh", bank: "MB Bank", apis: ["ID", "BA", "PI", "TR", "TX"], requests: "6,205", activity: "36 phút trước", status: "Active" },
  { id: "con_9FX4B2W8", initials: "DN", user: "Đỗ Tuấn Nam", bank: "ACB", apis: ["BA", "TX"], requests: "3,914", activity: "3 giờ trước", status: "Expiring" },
  { id: "con_1KU5T7H4", initials: "LA", user: "Lê Quỳnh Anh", bank: "VPBank", apis: ["ID", "VA"], requests: "1,287", activity: "Hôm qua", status: "Attention" },
  { id: "con_4RT6M8V0", initials: "HK", user: "Hoàng Gia Khánh", bank: "BIDV", apis: ["TX", "QR", "TR"], requests: "4,106", activity: "Hôm qua", status: "Active" },
];

const volume = [52, 59, 56, 66, 61, 73, 68, 79, 71, 84, 77, 88, 82, 91];
const labels = ["24/06", "", "29/06", "", "04/07", "", "09/07", "", "14/07", "", "19/07", "", "", "23/07"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [service, setService] = useState("All services");
  const [range, setRange] = useState("30 ngày qua");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => connections.filter((item) => {
    const matchesSearch = `${item.id} ${item.user} ${item.bank}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "All" || item.status === status;
    return matchesSearch && matchesStatus;
  }), [search, status]);

  function exportReport() {
    setNotice(`Đã chuẩn bị báo cáo ${range.toLowerCase()}${service !== "All services" ? ` cho ${service}` : ""}.`);
    window.setTimeout(() => setNotice(""), 3200);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Cas Console home"><span className="brand-mark">C</span><span>Cas Console</span></a>
        <nav className="nav" aria-label="Main navigation">
          <a className="active" href="#overview">Tổng quan</a>
          <a href="#connections">Kết nối</a>
          <a href="#usage">API usage</a>
          <a href="#logs">Logs</a>
          <a href="#developers">Developers</a>
        </nav>
        <div className="top-actions">
          <span className="environment">Production</span>
          <button className="icon-button" aria-label="Thông báo">●<span className="notification-dot" /></button>
          <span className="avatar">FF</span>
        </div>
      </header>

      <div className="appbar">
        <button className="app-switcher">
          <span className="app-icon">F</span>
          <span><strong>FinFlow Production</strong><small>app_8F2KD91M</small></span>
          <span className="chevron">⌄</span>
        </button>
        <span className="system-status"><i />Tất cả hệ thống hoạt động bình thường</span>
      </div>

      <main className="main" id="overview">
        <div className="page-heading">
          <div>
            <p className="eyebrow">APP ANALYTICS</p>
            <h1>Tổng quan Usage</h1>
            <p>Theo dõi kết nối end user và hoạt động Open Banking API.</p>
          </div>
          <div className="filters">
            <label><span>Khoảng thời gian</span><select value={range} onChange={(e) => setRange(e.target.value)}><option>7 ngày qua</option><option>30 ngày qua</option><option>90 ngày qua</option></select></label>
            <label><span>Dịch vụ</span><select value={service} onChange={(e) => setService(e.target.value)}><option>All services</option>{services.map((item) => <option key={item.code}>{item.name}</option>)}</select></label>
            <button className="primary-button" onClick={exportReport}>↓ Xuất báo cáo</button>
          </div>
        </div>

        {notice && <div className="toast" role="status">{notice}</div>}

        <section className="kpis" aria-label="Key metrics">
          <Metric label="Tổng API requests" value="1.28M" delta="+12.4%" note="so với kỳ trước" progress={82} />
          <Metric label="Active connections" value="2,847" delta="+184" note="trong 30 ngày" progress={71} green />
          <Metric label="Success rate" value="99.72%" delta="+0.08%" note="trên tất cả API" progress={99} green />
          <Metric label="P95 response time" value="428 ms" delta="SLA < 600 ms" note="nhanh hơn 34 ms" progress={64} />
        </section>

        <section className="analytics-grid" id="usage">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">REQUEST VOLUME</p><h2>Hoạt động API</h2></div>
              <div className="legend"><span><i className="swatch success" />Thành công</span><span><i className="swatch failed" />Thất bại</span></div>
            </div>
            <div className="chart-body">
              <div className="chart-summary">
                <div><strong>46,912</strong><span>requests hôm nay</span></div>
                <div><strong className="green-text">99.79%</strong><span>thành công</span></div>
                <div><strong>391 ms</strong><span>độ trễ TB</span></div>
              </div>
              <div className="chart-area">
                <div className="axis"><span>60k</span><span>40k</span><span>20k</span><span>0</span></div>
                <div className="bars">
                  {volume.map((height, index) => (
                    <div className="bar-slot" key={index} title={`${Math.round(height * 660)} requests`}>
                      <span className="success-bar" style={{ height: `${height}%` }} />
                      <span className="failed-bar" style={{ height: `${3 + (index % 3)}%` }} />
                      <small>{labels[index]}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="panel service-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">SERVICE BREAKDOWN</p><h2>Usage theo dịch vụ</h2></div>
              <span className="muted">30 ngày</span>
            </div>
            <div className="service-list">
              {services.map((item) => (
                <button className="service-row" key={item.code} onClick={() => setService(item.name)}>
                  <span className="service-code">{item.code}</span>
                  <span className="service-name"><strong>{item.name}</strong><small>{item.requests} requests</small></span>
                  <span className="service-meter"><i style={{ width: `${(item.value / services[0].value) * 100}%` }} /></span>
                  <span className="service-rate">{item.rate}</span>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="panel connections-panel" id="connections">
          <div className="panel-heading table-heading">
            <div><p className="eyebrow">END-USER CONNECTIONS</p><h2>Kết nối gần đây <span className="count-badge">2,847 active</span></h2></div>
            <div className="table-tools">
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm connection, user hoặc ngân hàng…" aria-label="Tìm kiếm kết nối" /></label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Lọc theo trạng thái"><option value="All">Tất cả trạng thái</option><option>Active</option><option>Expiring</option><option>Attention</option></select>
              <button className="secondary-button">Xem tất cả kết nối →</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Connection</th><th>End user</th><th>Ngân hàng</th><th>Dịch vụ sử dụng</th><th>Requests (30d)</th><th>Hoạt động cuối</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><button className="connection-id">{item.id}</button></td>
                    <td><div className="user-cell"><span className="user-avatar">{item.initials}</span><strong>{item.user}</strong></div></td>
                    <td>{item.bank}</td>
                    <td><div className="api-tags">{item.apis.slice(0, 4).map((api) => <span key={api}>{api}</span>)}{item.apis.length > 4 && <small>+{item.apis.length - 4}</small>}</div></td>
                    <td className="numeric">{item.requests}</td>
                    <td className="muted-cell">{item.activity}</td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-state">Không tìm thấy connection phù hợp.</div>}
          </div>
          <div className="table-footer"><span>Hiển thị {filtered.length} trong 2,847 connections</span><div><button aria-label="Trang trước">‹</button><button className="page-active">1</button><button>2</button><button>3</button><button aria-label="Trang sau">›</button></div></div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, delta, note, progress, green = false }: { label: string; value: string; delta: string; note: string; progress: number; green?: boolean }) {
  return <article className="panel metric"><div className="metric-top"><span>{label}</span><span className="metric-kebab">•••</span></div><div className="metric-value"><strong>{value}</strong><span className={green ? "green-text" : ""}>{delta}</span></div><div className="progress"><i className={green ? "green-progress" : ""} style={{ width: `${progress}%` }} /></div><small>{note}</small></article>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge ${status.toLowerCase()}`}><i />{status === "Active" ? "Đang hoạt động" : status === "Expiring" ? "Sắp hết hạn" : "Cần kiểm tra"}</span>;
}
