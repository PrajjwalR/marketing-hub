import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Elephant: AI Video Generator and Scheduler App",
  description: "Agent Elephant is a video generation and scheduling app that uses AI to generate videos and schedule them for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          data-tracker="7f12607e-73a3-409e-991a-3c393ce9e279"
          data-hosts="vidmaxx.vercel.app"
          src="https://www.webtracky.com/analytics.js"
        ></script>
      </head>
      <body
        className={`${hankenGrotesk.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
