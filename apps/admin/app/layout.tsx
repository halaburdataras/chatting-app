import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Theme } from '@radix-ui/themes'
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatting App Admin",
  description: "Configure your chatting app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Theme>
          {children}
        </Theme>
      </body>
    </html>
  );
}
