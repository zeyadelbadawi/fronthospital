"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashBoardLayerEight from "@/components/DashBoardLayerEight"
import MasterLayout from "@/masterLayout/MasterLayout"
import { ModelProvider } from "@/contexts/ModelContext"
import RBACWrapper from "@/components/RBACWrapper"
import { isStaffSubdomain } from "@/utils/subdomain-utils"

function HomePage() {
  return (
    <MasterLayout>
      <ModelProvider>
        <DashBoardLayerEight />
      </ModelProvider>
    </MasterLayout>
  )
}

function RootPageContent() {
  const router = useRouter()

  useEffect(() => {
    const onStaffSubdomain = isStaffSubdomain()

    if (!onStaffSubdomain) {
      // On main domain, redirect to clientportal
      router.replace("/clientportal")
    }
  }, [router])

  // On staff subdomain, show the admin dashboard
  return (
    <RBACWrapper loadingMessage="Loading dashboard...">
      <HomePage />
    </RBACWrapper>
  )
}

export default function Page() {
  return <RootPageContent />
}
