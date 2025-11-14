import type { Metadata } from "next";
import "./globals.css";
import { ExperimentProvider } from "./providers/experiment-provider";

export const metadata: Metadata = {
  title: "Tutor Quality Dashboard",
  description: "Monitor tutor performance metrics and churn risk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ExperimentProvider>
          {children}
        </ExperimentProvider>
      </body>
    </html>
  );
}
