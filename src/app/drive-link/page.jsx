"use client"
import RBACWrapper from "@/components/RBACWrapper"
import StudentForm from "@/components/StudentForm"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

function DriveLinkContent() {
  return (
    <MasterLayout>
      <Breadcrumb heading="Google Drive link" title="Google Drive link" />
      <StudentForm />
    </MasterLayout>
  )
}

export default function DriveLinkPage() {
  return <RBACWrapper>{() => <DriveLinkContent />}</RBACWrapper>
}
