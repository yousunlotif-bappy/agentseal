import type { Metadata } from "next";
import AgentSealTopBrand from "./components/AgentSealTopBrand";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentSeal Trust Console",
  description:
    "AI agent testing, red-team validation, risk governance, release certification, and runtime monitoring.",
};

/**
 * RootLayout
 * ----------
 * This is the global layout for the entire AgentSeal app.
 *
 * The AgentSealTopBrand component is placed here so every page gets:
 * - consistent logo
 * - consistent product identity
 * - professional production-style header
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AgentSealTopBrand />
        {children}
      </body>
    </html>
  );
}


