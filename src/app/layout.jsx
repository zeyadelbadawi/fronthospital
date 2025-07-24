import "./font.css"
import "./globals.css"
import { LanguageProvider } from "../contexts/LanguageContext"
import { registerLicense } from "@syncfusion/ej2-base"

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY)

export const metadata = {
  title: "RUKN ALWATIKON CENTER",
  description:
    "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}</LanguageProvider>

      </body>
    </html>
  )
}
