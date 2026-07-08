import React from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { Header } from "@/components/ui/Header";
import "@/styles/global.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AssessmentProvider>
          <div className={"layout"}>
            <Header />
            <main className={"content"}>{children}</main>
          </div>
        </AssessmentProvider>
      </body>
    </html>
  );
}
