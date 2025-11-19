"use client"
import RBACWrapper from "@/components/RBACWrapper"
import AccountantHeader from "../../../components/accountant-header"
import PublicProfileAccountant from "../../../components/PublicProfileAccountant"

function ProfileAccountantContent({ user, handleLogout }) {
  return (
    <>
      <AccountantHeader user={user} loading={false} onLoginClick={() => {}} onLogout={handleLogout} />
      <PublicProfileAccountant />
    </>
  )
}

export default function ProfileAccountantPage() {
  return (
    <RBACWrapper>
      {({ user, handleLogout }) => <ProfileAccountantContent user={user} handleLogout={handleLogout} />}
    </RBACWrapper>
  )
}
