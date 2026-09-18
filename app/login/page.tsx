"use client";

import { useState } from "react";
import "./login.css";
import { type Lang, LoginTopbar, ServiceShowcase, IconMail, IconLock, IconShield, IconBadgeCheck } from "./shared";

const copy = {
  vi: {
    welcome: "Chào mừng quay trở lại",
    noAccount: "Bạn chưa có tài khoản?",
    signUp: "Đăng ký",
    email: "Email",
    password: "Mật khẩu",
    show: "Hiện",
    hide: "Ẩn",
    submit: "Đăng nhập",
    forgot: "Đặt lại mật khẩu",
    footnotePrefix: "Bằng việc đăng nhập, bạn đồng ý với",
    termsLabel: "Điều khoản dịch vụ",
    footnoteMid: "và",
    privacyLabel: "Chính sách bảo mật",
    footnoteSuffix: " của CAS.",
    tag: "OPEN BANKING PLATFORM",
    headline: "Mỗi doanh nghiệp là một ngân hàng số",
    lede: "Một nền tảng API duy nhất cho Thanh toán, Chuyển tiền, eKYC và toàn bộ hạ tầng Open Banking của doanh nghiệp bạn.",
    footerLabel: "Được tin dùng bởi các đối tác ngân hàng & fintech tại Việt Nam",
    remember: "Ghi nhớ đăng nhập",
    trust1: "Mã hoá đầu cuối",
    trust2: "Tuân thủ ISO 27001",
  },
  en: {
    welcome: "Welcome back",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    email: "Email",
    password: "Password",
    show: "Show",
    hide: "Hide",
    submit: "Sign in",
    forgot: "Reset password",
    footnotePrefix: "By signing in, you agree to CAS's",
    termsLabel: "Terms of Service",
    footnoteMid: "and",
    privacyLabel: "Privacy Policy",
    footnoteSuffix: ".",
    tag: "OPEN BANKING PLATFORM",
    headline: "Every business, its own digital bank",
    lede: "One API platform for Payments, Transfers, eKYC and your entire Open Banking infrastructure.",
    footerLabel: "Trusted by banking & fintech partners across Vietnam",
    remember: "Remember me",
    trust1: "End-to-end encryption",
    trust2: "ISO 27001 compliant",
  },
} as const;

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>("vi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const t = copy[lang];

  return (
    <div className="login-shell">
      <div className="login-form-side">
        <LoginTopbar lang={lang} setLang={setLang} />

        <div className="login-form-wrap">
          <form className="login-form" onSubmit={e => e.preventDefault()}>
            <h1>{t.welcome}</h1>
            <p className="login-form-sub">{t.noAccount} <a href="/signup">{t.signUp}</a></p>

            <div className="login-field">
              <label htmlFor="login-email">{t.email}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconMail /></span>
                <input id="login-email" type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">{t.password}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconLock /></span>
                <input id="login-password" type={showPassword ? "text" : "password"} placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" className="toggle-visibility" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? t.hide : t.show}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" />
                {t.remember}
              </label>
              <a className="login-forgot-inline" href="#">{t.forgot}</a>
            </div>

            <button type="submit" className="login-submit">
              {t.submit}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            <div className="login-trust-row">
              <span className="login-trust-item"><IconShield /> {t.trust1}</span>
              <span className="login-trust-item"><IconBadgeCheck /> {t.trust2}</span>
            </div>
          </form>
        </div>

        <p className="login-footnote">
          {t.footnotePrefix} <a href="https://cas.so/cas-id/dieu-khoan-su-dung/" target="_blank" rel="noopener noreferrer">{t.termsLabel}</a> {t.footnoteMid} <a href="https://cas.so/cas-id/chinh-sach-bao-mat/" target="_blank" rel="noopener noreferrer">{t.privacyLabel}</a>{t.footnoteSuffix}
        </p>
      </div>

      <ServiceShowcase lang={lang} tag={t.tag} headline={t.headline} lede={t.lede} />
    </div>
  );
}
