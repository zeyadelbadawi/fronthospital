"use client"
import RBACWrapper from "@/components/RBACWrapper"
import GenericUserForm from "@/components/GenericUserForm"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

function AddPageContent({ role }) {
  const heading = `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`
  const title = `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`

  return (
    <MasterLayout>
      <Breadcrumb heading={heading} title={title} />
      <GenericUserForm role={role} mode="add" />
    </MasterLayout>
  )
}

export default function AddPageClientWrapper({ params }) {
  const role = params.role

  return <RBACWrapper>{() => <AddPageContent role={role} />}</RBACWrapper>
}
