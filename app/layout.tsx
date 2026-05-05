import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Kavuka Experts — ATS GUÉP",
  description: "A plataforma que transforma currículos em inteligência humana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
