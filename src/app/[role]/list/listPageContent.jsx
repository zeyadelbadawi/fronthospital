"use client"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"
import GenericUserList from "@/components/GenericUserList"

function ListPageContent({ role }) {
  const heading = `All ${role.charAt(0).toUpperCase() + role.slice(1)}s`
  const title = `All ${role.charAt(0).toUpperCase() + role.slice(1)}s`

  return (
    <MasterLayout>
      <Breadcrumb heading={heading} title={title} />
      <GenericUserList role={role} />
    </MasterLayout>
  )
}

export default ListPageContent
