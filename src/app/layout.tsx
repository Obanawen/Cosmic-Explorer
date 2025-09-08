import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { StageProgressProvider } from "@/lib/stageProgress";
import Galaxy from "@/components/ui/galaxy";

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
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistMono.variable} antialiased font-sans relative bg-transparent`}
        >
          <div className="fixed inset-0 -z-10 bg-black">
            <Galaxy 
              mouseRepulsion={true}
              mouseInteraction={true}
              density={1}
              glowIntensity={0.3}
              autoCenterRepulsion={0}
              saturation={0}
              hueShift={140}
              twinkleIntensity={0.3}
              rotationSpeed={0.1}
              disableAnimation={false}
              speed={1.0}
              rotation={[1.0, 0.0]}
              focal={[0.5, 0.5]}
              transparent={true}
              
            />
          </div>
          <StageProgressProvider>
            <Navigation />
            <main>
              {children}
            </main>
          </StageProgressProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
