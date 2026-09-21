"use client";

import { useState } from "react";
import "../login/login.css";
import { type Lang, LoginTopbar, ServiceShowcase, IconMail } from "../login/shared";

const copy = {
  vi: {
    welcome: "Vui lòng nhập Email",
    rememberedPassword: "Bạn đã nhớ mật khẩu?",
    signIn: "Đăng nhập",
    email: "Email",
    submit: "Yêu cầu đặt lại mật khẩu",
    confirmTitle: "Chúng tôi đã gửi cho bạn email đặt lại mật khẩu",
    exploreMore: "Khám phá trang web thêm?",
    backHome: "Quay về trang chủ",
    confirmBody: "Hãy kiểm tra email của bạn. Nếu nó không có ở đó, có thể kiểm tra nó trong phần thư mục spam của bạn.",
    tag: "OPEN BANKING PLATFORM",
    headline: "Mỗi doanh nghiệp là một ngân hàng số",
    lede: "Một nền tảng API duy nhất cho Thanh toán, Chuyển tiền, eKYC và toàn bộ hạ tầng Open Banking của doanh nghiệp bạn.",
  },
  en: {
    welcome: "Please enter your email",
    rememberedPassword: "Remembered your password?",
    signIn: "Sign in",
    email: "Email",
    submit: "Request password reset",
    confirmTitle: "We sent you a password reset email",
    exploreMore: "Want to explore more?",
    backHome: "Back to homepage",
    confirmBody: "Please check your email. If it's not there, check your spam folder.",
    tag: "OPEN BANKING PLATFORM",
    headline: "Every business, its own digital bank",
    lede: "One API platform for Payments, Transfers, eKYC and your entire Open Banking infrastructure.",
  },
} as const;

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState<Lang>("vi");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = copy[lang];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="login-shell">
        <div className="login-form-side">
          <LoginTopbar lang={lang} setLang={setLang} />

          <div className="login-form-wrap">
            <div className="login-form signup-confirm">
              <h1>{t.confirmTitle}</h1>
              <p className="login-form-sub"><strong>{t.exploreMore}</strong> <a href="/">{t.backHome}</a></p>
              <p className="signup-confirm-body">{t.confirmBody}</p>
            </div>
          </div>
        </div>

        <ServiceShowcase lang={lang} tag={t.tag} headline={t.headline} lede={t.lede} />
      </div>
    );
  }

  return (
    <div className="login-shell">
      <div className="login-form-side">
        <LoginTopbar lang={lang} setLang={setLang} />

        <div className="login-form-wrap">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1>{t.welcome}</h1>
            <p className="login-form-sub">{t.rememberedPassword} <a href="/login">{t.signIn}</a></p>

            <div className="login-field">
              <label htmlFor="forgot-email">{t.email}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconMail /></span>
                <input id="forgot-email" type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <button type="submit" className="login-submit">
              {t.submit}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </div>
      </div>

      <ServiceShowcase lang={lang} tag={t.tag} headline={t.headline} lede={t.lede} />
    </div>
  );
}
