"use client";

import { useEffect, useState } from "react";
import "../login/login.css";
import { type Lang, LoginTopbar, ServiceShowcase, IconMail, IconUser, IconPhone, IconLock, IconShield, IconBadgeCheck } from "../login/shared";

const copy = {
  vi: {
    welcome: "Tạo tài khoản mới",
    haveAccount: "Bạn đã có tài khoản?",
    signIn: "Đăng nhập",
    email: "Email",
    name: "Tên",
    phone: "Số điện thoại",
    password: "Mật khẩu",
    confirmPassword: "Xác thực mật khẩu",
    show: "Hiện",
    hide: "Ẩn",
    submit: "Đăng ký",
    passwordMismatch: "Mật khẩu xác thực không khớp",
    footnotePrefix: "Bằng việc đăng ký, bạn đồng ý với",
    termsLabel: "Điều khoản dịch vụ",
    footnoteMid: "và",
    privacyLabel: "Chính sách bảo mật",
    footnoteSuffix: " của CAS.",
    tag: "OPEN BANKING PLATFORM",
    headline: "Mỗi doanh nghiệp là một ngân hàng số",
    lede: "Một nền tảng API duy nhất cho Thanh toán, Chuyển tiền, eKYC và toàn bộ hạ tầng Open Banking của doanh nghiệp bạn.",
    trust1: "Mã hoá đầu cuối",
    trust2: "Tuân thủ ISO 27001",
    successToast: "Thành công",
    confirmTitle: "Chúng tôi đã gửi cho bạn email xác nhận",
    exploreMore: "Khám phá trang web thêm?",
    backHome: "Quay về trang chủ",
    confirmBody: "Hãy kiểm tra email của bạn. Nếu nó không có ở đó, có thể kiểm tra nó trong phần thư mục spam của bạn.",
  },
  en: {
    welcome: "Create a new account",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    email: "Email",
    name: "Name",
    phone: "Phone number",
    password: "Password",
    confirmPassword: "Confirm password",
    show: "Show",
    hide: "Hide",
    submit: "Sign up",
    passwordMismatch: "Passwords don't match",
    footnotePrefix: "By signing up, you agree to CAS's",
    termsLabel: "Terms of Service",
    footnoteMid: "and",
    privacyLabel: "Privacy Policy",
    footnoteSuffix: ".",
    tag: "OPEN BANKING PLATFORM",
    headline: "Every business, its own digital bank",
    lede: "One API platform for Payments, Transfers, eKYC and your entire Open Banking infrastructure.",
    trust1: "End-to-end encryption",
    trust2: "ISO 27001 compliant",
    successToast: "Success",
    confirmTitle: "We sent you a confirmation email",
    exploreMore: "Want to explore more?",
    backHome: "Back to homepage",
    confirmBody: "Please check your email. If it's not there, check your spam folder.",
  },
} as const;

export default function SignupPage() {
  const [lang, setLang] = useState<Lang>("vi");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const t = copy[lang];

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, [showToast]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordMismatch) return;
    setSubmitted(true);
    setShowToast(true);
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

        {showToast && (
          <div className="login-toast" role="status">
            <IconBadgeCheck />
            {t.successToast}
            <button type="button" aria-label="Đóng" onClick={() => setShowToast(false)}>×</button>
          </div>
        )}
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
            <p className="login-form-sub">{t.haveAccount} <a href="/login">{t.signIn}</a></p>

            <div className="login-field">
              <label htmlFor="signup-email">{t.email}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconMail /></span>
                <input id="signup-email" type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="signup-name">{t.name}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconUser /></span>
                <input id="signup-name" type="text" placeholder={t.name} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="signup-phone">{t.phone}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconPhone /></span>
                <input id="signup-phone" type="tel" placeholder={t.phone} value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="signup-password">{t.password}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconLock /></span>
                <input id="signup-password" type={showPassword ? "text" : "password"} placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" className="toggle-visibility" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? t.hide : t.show}
                </button>
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="signup-confirm-password">{t.confirmPassword}</label>
              <div className="login-field-input">
                <span className="field-icon"><IconLock /></span>
                <input id="signup-confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder={t.confirmPassword} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" className="toggle-visibility" onClick={() => setShowConfirmPassword(v => !v)}>
                  {showConfirmPassword ? t.hide : t.show}
                </button>
              </div>
              {passwordMismatch && <p className="login-field-error">{t.passwordMismatch}</p>}
            </div>

            <button type="submit" className="login-submit" disabled={passwordMismatch}>
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
