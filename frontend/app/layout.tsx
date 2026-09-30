import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import type { Metadata } from "next"
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Library Search",
  description: "Search the library catalog and view book details.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable
      )}
    >
      <body className="m-0 min-h-screen p-0">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
