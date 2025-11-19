"use client"

import GenericUserForm from "@/components/GenericUserForm"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

function EditPageContent({ role, id }) {
  const heading = `Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`
  const title = `Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`

  return (
    <MasterLayout>
      <Breadcrumb heading={heading} title={title} />
      <GenericUserForm role={role} mode="edit" id={id} />
    </MasterLayout>
  )
}

export default EditPageContent
