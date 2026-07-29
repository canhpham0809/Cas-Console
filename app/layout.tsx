import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "latin-ext"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/cas-console-og.png`;

  return {
    title: "CAS Console — Open Banking Platform",
    description: "Console vận hành cho Vendor quản lý Apps, end-user connections và các dịch vụ Open Banking của CAS.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "CAS Console — Open Banking Platform",
      description: "Quản lý Apps, tích hợp ngân hàng và theo dõi hoạt động Open Banking trên một nền tảng.",
      images: [imageUrl],
    },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
