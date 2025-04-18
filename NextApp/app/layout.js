import { Geist, Geist_Mono, Chakra_Petch } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // Customize weights as needed
  variable: '--font-chakra', // optional for Tailwind integration
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Naive Boyes",
  description: "Optimal path finding ML model",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${chakra.variable} antialiased flex flex-col min-h-screen`}
      >
        <main className="flex-1 relative isolate">
          <div
            className="absolute inset-0 -z-10 opacity-[1]"
            style={{
              backgroundImage: 'url(/dark.svg)',
              backgroundSize: 'cover',
              backgroundPosition: '10% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed'
            }}
          />
          <Navbar />

          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
