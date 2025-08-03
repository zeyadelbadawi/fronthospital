import GenericUserProfile from "@/components/GenericUserProfile"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

export async function generateMetadata({ params }) {
  const awaitedParams = await params
  const role = awaitedParams.role.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  return {
    title: `Rukn Alwatikon Center - ${role} Profile`,
    description: `View ${role} profile details.`,
  }
}

const ViewPage = async ({ params }) => {
  const awaitedParams = await params
  const role = awaitedParams.role // e.g., 'student', 'doctor', 'accountant'
  const id = awaitedParams.id
  const heading = `${role.charAt(0).toUpperCase() + role.slice(1)} Profile`
  const title = `${role.charAt(0).toUpperCase() + role.slice(1)} Profile`

  return (
    <>
      <MasterLayout>
        <Breadcrumb heading={heading} title={title} />
        <GenericUserProfile role={role} id={id} />
      </MasterLayout>
    </>
  )
}

export default ViewPage
