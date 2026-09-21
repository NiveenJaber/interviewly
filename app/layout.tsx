import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Interviewly | Practice with purpose", description: "A thoughtful interview practice space tailored to your resume and the role you want." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
