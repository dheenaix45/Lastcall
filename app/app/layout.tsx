import type { Metadata } from "next";
import "./globals.css";
import "./animations.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "LastCall",
  description: "Rescue hot leftover food within its 2-hour safe window.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}