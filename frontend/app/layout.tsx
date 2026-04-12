import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleLab — System Design Playground",
  description:
    "Enter a system design prompt. Get structured output: components, tradeoffs, bottlenecks, and scaling strategies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
