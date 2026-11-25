import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مساعد AI",
  description: "تطبيق ذكاء اصطناعي متجاوب مع الهواتف والويب",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}