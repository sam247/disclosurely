import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclosurely - Next.js Public Site",
  description:
    "SEO-first public experience for Disclosurely. Dashboard remains on Vite."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

