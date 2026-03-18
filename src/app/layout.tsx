import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppNav } from "@/components/layout/AppNav";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Családi App",
  description: "Kanban, személyek, jegyzetek, naptár, galéria",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <AppNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
