import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FormulaBids - F1 Prediction Market",
  description: "The Ultimate F1 Prediction Market - Predict F1 moments and earn real money when you're right",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>
          {children}
          <Analytics />
        </ThirdwebProvider>
      </body>
    </html>
  );
}
