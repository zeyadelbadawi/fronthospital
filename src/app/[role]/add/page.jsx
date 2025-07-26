import GenericUserForm from "@/components/GenericUserForm"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

export async function generateMetadata({ params }) {
  const awaitedParams = await params
  const role = awaitedParams.role.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  return {
    title: `Rukn Alwatikon Center - Add ${role}`,
    description: `Add a new ${role} profile.`,
  }
}

const AddPage = async ({ params }) => {
  // Make the component async
  const awaitedParams = await params // Await params
  const role = awaitedParams.role // e.g., 'student', 'doctor', 'accountant'
  const heading = `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`
  const title = `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`

  return (
    <>
      <MasterLayout>
        <Breadcrumb heading={heading} title={title} />
        <GenericUserForm role={role} mode="add" />
      </MasterLayout>
    </>
  )
}

export default AddPage
