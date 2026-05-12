import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MACAEPREV — Sistema de Consignações",
  description:
    "Sistema de controle de consignações e margem dos servidores de Macaé.",
};

import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../services/notification";
import { ErrorBoundary, NotificationContainer } from "../components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body suppressHydrationWarning>
        <NotificationProvider>
          <ErrorBoundary>
            <AuthProvider>
              {children}
              <NotificationContainer />
            </AuthProvider>
          </ErrorBoundary>
        </NotificationProvider>
      </body>
    </html>
  );
}
