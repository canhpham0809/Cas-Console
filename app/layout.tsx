import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "CAS Console — Open Banking Platform",
  description: "Console vận hành cho Vendor quản lý Apps, end-user connections và các dịch vụ Open Banking của CAS.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "CAS Console — Open Banking Platform",
    description: "Quản lý Apps, tích hợp ngân hàng và theo dõi hoạt động Open Banking trên một nền tảng.",
    images: ["/cas-console-og.png"],
  },
  twitter: { card: "summary_large_image", images: ["/cas-console-og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={roboto.variable}>
        {children}
      </body>
    </html>
  );
}
