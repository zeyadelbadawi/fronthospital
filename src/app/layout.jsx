import "./font.css"
import "./globals.css"

import { LanguageProvider } from "../contexts/LanguageContext"
import { registerLicense } from "@syncfusion/ej2-base"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY)

export const metadata = {
  title: "Rukn Alwatikon Center",
  description:
    "Rukn Alwatikon Center in the UAE offers specialized rehabilitation, sensory therapy, speech and behavior support, and inclusive education services for students of determination. Empowering children to thrive with tailored care.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}<ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
          progressClassName="custom-toast-progress"
        /> </LanguageProvider>

      </body>
    </html>
  )
}
