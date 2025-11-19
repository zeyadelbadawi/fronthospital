"use client"
import GenericUserProfile from "@/components/GenericUserProfile"
import Breadcrumb from "@/components/Breadcrumb"

function ViewPageContent({ role, id }) {
  const heading = `${role.charAt(0).toUpperCase() + role.slice(1)} Profile`
  const title = `${role.charAt(0).toUpperCase() + role.slice(1)} Profile`

  return (
    <>
      <Breadcrumb heading={heading} title={title} />
      <GenericUserProfile role={role} id={id} />
    </>
  )
}

export default ViewPageContent
