import { AccountantLanguageProvider } from "../../contexts/accountant-language-context"

export default function AccountantPortalLayout({ children }) {
  return <AccountantLanguageProvider>{children}</AccountantLanguageProvider>
}
