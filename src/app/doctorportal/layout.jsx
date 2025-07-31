import { DoctorLanguageProvider } from "../../contexts/doctor-language-context"

export default function DoctorPortalLayout({ children }) {
  return <DoctorLanguageProvider>{children}</DoctorLanguageProvider>
}
