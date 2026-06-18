import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ur check - Kiểm tra nguồn gốc sản phẩm mỹ phẩm",
  description: "Quét QR code để kiểm tra tính hợp lệ và thông tin chi tiết về sản phẩm mỹ phẩm. Hỗ trợ kiểm tra nguồn gốc, hạn sử dụng, và thông tin nhà sản xuất.",
  keywords: ["QR code", "kiểm tra sản phẩm", "mỹ phẩm", "verify product", "cosmetics"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ur check",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#17294d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">{children}</body>
    </html>
  );
}
