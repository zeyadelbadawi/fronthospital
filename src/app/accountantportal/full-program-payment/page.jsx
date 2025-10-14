"use client"
import RBACWrapper from "@/components/RBACWrapper"
import AccountantHeader from "../../../components/accountant-header"
import { AccountantAppointments } from "../../../components/accountant-appointments"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"

function FullProgramPaymentContent({ user, handleLogout }) {
  const { language } = useAccountantLanguage()

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <AccountantHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleLogout} />
      <AccountantAppointments />
    </div>
  )
}

export default function FullProgramPaymentPage() {
  return (
    <RBACWrapper>
      {({ user, handleLogout }) => <FullProgramPaymentContent user={user} handleLogout={handleLogout} />}
    </RBACWrapper>
  )
}
