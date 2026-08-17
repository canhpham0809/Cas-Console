import re

with open("app/page.tsx", "r") as f:
    content = f.read()

replacement = """  const commonApis = (scopeName: string, serviceTitle: string) => [
    {
      name: "API get Grant Token",
      method: "POST",
      url: "https://sandbox.bankhub.dev/grant/token",
      scope: scopeName,
      summary: `Khởi tạo phân quyền truy cập cho dịch vụ ${serviceTitle}.`,
      params: [
        { name: "scopes", type: "String", req: true, desc: `Danh sách quyền cần cấp, truyền: "${scopeName}"` }
      ],
      sampleReq: `{\\n  "scopes": "${scopeName}"\\n}`,
      sampleRes: "{\\n  \\"status\\": \\"SUCCESS\\",\\n  \\"grantToken\\": \\"gt_1234567890\\"\\n}"
    },
    {
      name: "Cas Link (Lấy publicToken)",
      method: "GET",
      url: "https://link.bankhub.dev",
      scope: "cas_link",
      summary: "Chuyển hướng người dùng đến Cas Link kèm grantToken để kết nối ngân hàng và nhận lại publicToken.",
      params: [
        { name: "grantToken", type: "String", req: true, desc: "Token nhận được từ bước tạo Grant" },
        { name: "redirectUri", type: "String", req: true, desc: "URL để hệ thống redirect về sau khi kết nối thành công" }
      ],
      sampleReq: `GET https://link.bankhub.dev?grantToken=gt_1234567890&redirectUri=https://yourapp.com/callback`,
      sampleRes: "https://yourapp.com/callback?publicToken=pt_0987654321"
    },
    {
      name: "API get accessToken",
      method: "POST",
      url: "https://sandbox.bankhub.dev/grant/exchange",
      scope: "exchange",
      summary: "Đổi publicToken lấy accessToken để sử dụng cho các API dịch vụ.",
      params: [
        { name: "publicToken", type: "String", req: true, desc: "Token nhận được sau khi người dùng kết nối qua Cas Link" }
      ],
      sampleReq: `{\\n  "publicToken": "pt_0987654321"\\n}`,
      sampleRes: "{\\n  \\"status\\": \\"SUCCESS\\",\\n  \\"accessToken\\": \\"at_1122334455\\"\\n}"
    }
  ];

  const actualCategory = selectedCategory === "QuickStart" ? (activeList[0] || "Transaction") : selectedCategory;
  const currDoc = productDocs[actualCategory] || productDocs.Transaction;
  const fullApis = currDoc ? [...commonApis(currDoc.scopeName, currDoc.title), ...currDoc.apis] : [];
  const currentApi = fullApis[selectedApiIndex] || fullApis[0];

  return (
    <div className="userguide-layout">
      {/* Left Menu - Accordion style */}
      <nav className="userguide-nav" style={{ padding: 0 }}>
        <div style={{ padding: "16px 16px 8px", fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.5px", borderBottom: "1px solid #e2e4ed" }}>
          DỊCH VỤ ĐÃ KÍCH HOẠT ({activeList.length})
        </div>

        <div style={{ padding: "8px 0" }}>
          {activeList.map(cat => {
            const doc = productDocs[cat];
            if (!doc) return null;
            const catFullApis = [...commonApis(doc.scopeName, doc.title), ...doc.apis];
            const isActiveGroup = actualCategory === cat;
            
            return (
              <div key={cat} className="userguide-nav-group" style={{ marginBottom: 4 }}>
                <button
                  className={`group-btn ${isActiveGroup ? "active" : ""}`}
                  onClick={() => { setSelectedCategory(cat); setSelectedApiIndex(0); }}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: isActiveGroup ? "#f1effc" : "transparent", color: isActiveGroup ? "#6956d9" : "#374151", fontWeight: isActiveGroup ? 600 : 500, fontSize: 13, border: "none", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <span>{usageTabLabel(cat as AnalyticsTab)}</span>
                  <span style={{ fontSize: 10, opacity: 0.6, transform: isActiveGroup ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
                </button>
                {isActiveGroup && (
                  <div className="group-submenus" style={{ display: "flex", flexDirection: "column", background: "#f8f9fc", borderBottom: "1px solid #e2e4ed", padding: "4px 0" }}>
                    {catFullApis.map((api, idx) => (
                      <button
                        key={api.name}
                        className={`submenu-btn ${selectedApiIndex === idx ? "active" : ""}`}
                        onClick={() => setSelectedApiIndex(idx)}
                        style={{ display: "flex", alignItems: "center", fontSize: 12, padding: "8px 16px 8px 24px", textAlign: "left", background: selectedApiIndex === idx ? "#e7e4f9" : "transparent", color: selectedApiIndex === idx ? "#6956d9" : "#4b5563", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        <span className={`endpoint-method ${api.method.toLowerCase()}`} style={{ fontSize: 9, marginRight: 8, padding: "2px 4px", minWidth: 36, textAlign: "center", borderRadius: 4 }}>{api.method}</span>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{api.name}</span>
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
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{currDoc.title}</h3>
            <span className="status-pill">Active Service</span>
          </div>
          <p style={{ margin: "0 0 16px 0", color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>{currDoc.desc}</p>
          
          <hr style={{ border: "none", borderTop: "1px dashed #e2e4ed", margin: "16px 0" }} />

          {/* Selected API Document Detail */}
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#1e2130" }}>{currentApi.name}</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className={`endpoint-method ${currentApi.method.toLowerCase()}`}>{currentApi.method}</span>
              <span className="endpoint-url">{currentApi.url}</span>
              <span className="status-pill" style={{ marginLeft: "auto", fontSize: 10 }}>Scope: {currentApi.scope}</span>
            </div>
            <p style={{ margin: "4px 0 12px", color: "var(--muted)", fontSize: 12 }}>{currentApi.summary}</p>

            {/* Request Parameters Table */}
            <strong style={{ fontSize: 12, display: "block", marginTop: 14 }}>Request Parameters</strong>
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
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>
                Ngân hàng
                <FormSelect
                  value={testBank}
                  onChange={e => setTestBank(e.target.value)}
                  options={["Techcombank", "Vietcombank", "MB Bank", "ACB", "BIDV", "Sacombank", "VietinBank", "VPBank", "TPBank"]}
                  size="sm"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>
                Số tiền giao dịch (VNĐ)
                <FormInput
                  value={testAmount}
                  onChange={e => setTestAmount(e.target.value)}
                  placeholder="VD: 1500000"
                  size="sm"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>
                Tên tài khoản / Thụ hưởng
                <FormInput
                  value={testAccountName}
                  onChange={e => setTestAccountName(e.target.value)}
                  placeholder="VD: Nguyễn Minh Anh"
                  size="sm"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>
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
            <pre style={{ margin: 0, padding: 12, background: "#171827", color: "#e2e8f0", borderRadius: 8, fontSize: 11, overflowX: "auto", fontFamily: "var(--font-jakarta), monospace" }}>
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
            <pre style={{ margin: 0, padding: 12, background: "#171827", color: "#38bdf8", borderRadius: 8, fontSize: 11, overflowX: "auto", fontFamily: "var(--font-jakarta), monospace" }}>
              <code>{currentApi.sampleRes}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
"""

# Extract the part to replace using regex
pattern = re.compile(r"  const currDoc = productDocs\[selectedCategory\] \|\| productDocs\.QRPay;.*?\n    </div>\n  \);\n}", re.DOTALL)
new_content = pattern.sub(replacement + "\n}", content)

with open("app/page.tsx", "w") as f:
    f.write(new_content)
