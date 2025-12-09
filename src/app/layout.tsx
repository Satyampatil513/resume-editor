import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Resume Editor | AI-Powered LaTeX Resumes",
    template: "%s | Resume Editor"
  },
  description: "Create professional, ATS-friendly resumes with the power of AI and LaTeX. Real-time preview, instant feedback, and perfect formatting.",
  keywords: ["resume builder", "AI resume", "LaTeX resume", "ATS friendly", "professional CV", "resume editor"],
  authors: [{ name: "Satyam & Co." }],
  creator: "Satyam & Co.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resume-editor.com",
    title: "Resume Editor | Craft Perfect Resumes with AI",
    description: "Stop fighting formatting. Use AI + LaTeX to build the perfect resume in minutes.",
    siteName: "Resume Editor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Editor | AI-Powered LaTeX Resumes",
    description: "Create professional, ATS-friendly resumes with the power of AI and LaTeX.",
    creator: "@satyampatil", // Replace with actual handle if available
  },
  metadataBase: new URL("https://resume-editor.com"),
};

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
