import GenericUserForm from "@/components/GenericUserForm"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

export async function generateMetadata({ params }) {
  const awaitedParams = await params
  const role = awaitedParams.role.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  return {
    title: `WowDash NEXT JS - Edit ${role}`,
    description: `Edit ${role} profile.`,
  }
}

const EditPage = async ({ params }) => {
  // Make the component async
  const awaitedParams = await params // Await params
  const role = awaitedParams.role // e.g., 'student', 'doctor', 'accountant'
  const id = awaitedParams.id
  const heading = `Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`
  const title = `Edit ${role.charAt(0).toUpperCase() + role.slice(1)}`

  return (
    <>
      <MasterLayout>
        <Breadcrumb heading={heading} title={title} />
        <GenericUserForm role={role} mode="edit" id={id} />
      </MasterLayout>
    </>
  )
}

export default EditPage
