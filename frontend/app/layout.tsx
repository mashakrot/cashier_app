import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Scanner",
  description: "Real-time YOLO product detection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}