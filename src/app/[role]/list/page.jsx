import GenericUserList from "@/components/GenericUserList"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

export async function generateMetadata({ params }) {
  const awaitedParams = await params // Await params
  const role = awaitedParams.role.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  return {
    title: `WowDash NEXT JS - All ${role}s`,
    description: `List of all ${role}s.`,
  }
}

const ListPage = async ({ params }) => {
  // Make the component async
  const awaitedParams = await params // Await params
  const role = awaitedParams.role // e.g., 'student', 'doctor', 'accountant'
  const heading = `All ${role.charAt(0).toUpperCase() + role.slice(1)}s`
  const title = `All ${role.charAt(0).toUpperCase() + role.slice(1)}s`

  return (
    <>
      <MasterLayout>
        <Breadcrumb heading={heading} title={title} />
        <GenericUserList role={role} />
      </MasterLayout>
    </>
  )
}

export default ListPage
