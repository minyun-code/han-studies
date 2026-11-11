import Header from "./components/Header";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { LanguageProvider } from "./contexts/LanguageContext";
import Breadcrumb from "./components/Breadcrumb";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({ variable: "--font-noto-serif-jp", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "早稲田大学漢学研究所",
  description: "漢学研究",
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        <LanguageProvider>
          <Header />
          <Breadcrumb />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
