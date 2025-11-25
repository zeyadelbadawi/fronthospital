import AddPageClientWrapper from "./client-page"

export async function generateMetadata({ params }) {
  const awaitedParams = await params
  const role = awaitedParams.role.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  return {
    title: `Rukn Alwatikon Center - Add ${role}`,
    description: `Add a new ${role} profile.`,
  }
}

export default async function AddPage({ params }) {
  const awaitedParams = await params
  return <AddPageClientWrapper role={awaitedParams.role} />
}
