"use client"
import RBACWrapper from "@/components/RBACWrapper"
import AccountantHeader from "../../../components/accountant-header"
import ChecksComponent from "../../../components/checks"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"

function ChecksContent({ user, handleLogout }) {
  const { language } = useAccountantLanguage()

  return (
    <div>
      <AccountantHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleLogout} />
      <ChecksComponent language={language} />
    </div>
  )
}

export default function ChecksPage() {
  return (
    <RBACWrapper>{({ user, handleLogout }) => <ChecksContent user={user} handleLogout={handleLogout} />}</RBACWrapper>
  )
}
