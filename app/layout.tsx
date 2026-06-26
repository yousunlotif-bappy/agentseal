import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentSeal Trust Console",
  description:
    "Proof before production — AI agent testing, red-team validation, risk governance, and release certification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
