import { LanguageProvider } from "../contexts/LanguageContext"
import { registerLicense } from "@syncfusion/ej2-base"
import { ToastContainer } from "react-toastify"
import { LoadingProvider } from "../contexts/LoadingContext"
import LoadingSpinner from "../components/LoadingSpinner"
import NProgressBar from "../components/NProgressBar" // Import NProgressBar
import "../styles/nprogress.css"

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY)

export const metadata = {
  title: "Rukn Alwatikon Center",
  description:
    "Rukn Alwatikon Center in the UAE offers specialized rehabilitation, sensory therapy, speech and behavior support, and inclusive education services for students of determination. Empowering children to thrive with tailored care.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for better loading performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body suppressHydrationWarning={true}>
        <NProgressBar /> {/* NProgressBar is now a standalone component */}
        <LanguageProvider>
          <LoadingProvider>
            <LoadingSpinner />
            {children}
          </LoadingProvider>
          <ToastContainer
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
          />
        </LanguageProvider>
      </body>
    </html>
  )
}
