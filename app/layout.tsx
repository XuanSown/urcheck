import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Preloader } from "@/components/Preloader";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider, ThemeScript } from "@/components/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ur check - Kiểm tra nguồn gốc sản phẩm mỹ phẩm",
  description: "Quét mã QR để kiểm tra tính hợp lệ và thông tin chi tiết về sản phẩm mỹ phẩm. Hỗ trợ kiểm tra nguồn gốc, hạn sử dụng, và thông tin nhà sản xuất.",
  keywords: ["QR code", "mã QR", "verify product", "kiểm tra sản phẩm", "mỹ phẩm", "cosmetics"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ur check",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply theme class before page renders to prevent flash. */}
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <I18nProvider>
            <Preloader />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
