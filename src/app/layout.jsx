import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import MUIProvider from "../components/MUIProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Employee Management System",
  description: "Employee Management System for Login and Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MUIProvider>
          <AuthProvider>{children}</AuthProvider>
        </MUIProvider>
      </body>
    </html>
  );
}
