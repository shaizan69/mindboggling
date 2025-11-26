import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "MindMesh - Network of Intrusive Thoughts",
  description: "A place where random thoughts, intrusive ideas, fragments, and chaos are connected visually like a living mind-map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

