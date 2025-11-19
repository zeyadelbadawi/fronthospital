"use client"
import RBACWrapper from "@/components/RBACWrapper"
import ChecksComponent from "@/components/checks"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

function ChecksContent() {
  return (
    <MasterLayout>
      <Breadcrumb heading="Checks Managment System" title="Checks Managment System" />
      <ChecksComponent />
    </MasterLayout>
  )
}

export default function ChecksPage() {
  return (
    <RBACWrapper>
      <ChecksContent />
    </RBACWrapper>
  )
}
