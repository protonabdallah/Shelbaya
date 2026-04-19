import type { Metadata } from "next";
import "./globals.css";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PageTransition } from "@/components/ui/page-transition";
import { LanguageProvider } from "@/contexts/language-context";
import { CartProvider } from "@/contexts/cart-context";

export const metadata: Metadata = {
  title: "Shelbaya For Computers | شلباية للكمبيوتر",
  description: "Your ultimate tech destination — Laptops, Desktops, Gaming Gear & Peripherals. وجهتك التقنية الأولى.",
  keywords: "computers, laptops, gaming, peripherals, شلباية, كمبيوتر, لابتوب",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Shelbaya For Computers | شلباية للكمبيوتر",
    description: "Your ultimate tech destination — Laptops, Desktops, Gaming Gear & Peripherals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-[#0C0A09] text-white antialiased [cursor:none]"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <CartProvider>
            <ScrollProgress />
            <CustomCursor />
            <PageTransition>{children}</PageTransition>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
