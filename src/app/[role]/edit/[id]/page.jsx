"use client"

import { use } from "react"
import RBACWrapper from "@/components/RBACWrapper"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"
import GenericUserForm from "@/components/GenericUserForm"

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

export default function EditPage({ params }) {
  const awaitedParams = use(params)
  const role = awaitedParams.role
  const id = awaitedParams.id

  return (
    <RBACWrapper>
      <EditPageContent role={role} id={id} />
    </RBACWrapper>
  )
}
