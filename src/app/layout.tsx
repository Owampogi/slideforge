import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SlideForge — AI Presentation Generator",
  description: "Transform any text into professional presentations with AI-powered slide generation, presenter scripts, and PPTX export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0f1117] text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}