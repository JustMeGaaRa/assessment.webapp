import React from "react";
import { AssessmentProvider } from "@/context/AssessmentContext";
import "../index.css";

export const metadata = {
  title: "Technical Assessment Portal",
  description:
    "A modern, streamlined web application for engineering candidate assessments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50">
        <AssessmentProvider>{children}</AssessmentProvider>
      </body>
    </html>
  );
}
