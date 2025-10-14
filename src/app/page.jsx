"use client"

import DashBoardLayerEight from "@/components/DashBoardLayerEight"
import MasterLayout from "@/masterLayout/MasterLayout"
import { ModelProvider } from "@/contexts/ModelContext"
import RBACWrapper from "@/components/RBACWrapper"

function HomePage() {
  return (
    <MasterLayout>
      <ModelProvider>
        <DashBoardLayerEight />
      </ModelProvider>
    </MasterLayout>
  )
}

export default function Page() {
  return (
    <RBACWrapper loadingMessage="Loading dashboard...">
      <HomePage />
    </RBACWrapper>
  )
}
