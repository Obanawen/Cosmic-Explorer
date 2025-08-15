import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { StageProgressProvider } from "@/lib/stageProgress";

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CKY 5A Grader",
  description: "Support all kind of article, and give you a score",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased font-sans`}
      >
        <StageProgressProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </StageProgressProvider>
      </body>
    </html>
  );
}
