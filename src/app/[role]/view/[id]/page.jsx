import RBACWrapper from "@/components/RBACWrapper"
import MasterLayout from "@/masterLayout/MasterLayout"
import ViewPageContent from "./ViewPageContent"

export async function generateMetadata({ params }) {
  const awaitedParams = await params
  const role = awaitedParams.role.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  return {
    title: `Rukn Alwatikon Center - ${role} Profile`,
    description: `View ${role} profile details.`,
  }
}

export default async function ViewPage({ params }) {
  const awaitedParams = await params
  const role = awaitedParams.role
  const id = awaitedParams.id

  return (
    <RBACWrapper>
      {() => (
        <MasterLayout>
          <ViewPageContent role={role} id={id} />
        </MasterLayout>
      )}
    </RBACWrapper>
  )
}
