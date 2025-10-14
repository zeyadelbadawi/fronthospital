"use client"
import RBACWrapper from "@/components/RBACWrapper"
import PaymentTransactionsTable from "@/components/PaymentTransactionsTable"
import Breadcrumb from "@/components/Breadcrumb"
import MasterLayout from "@/masterLayout/MasterLayout"

function PaymentTransactionsContent() {
  return (
    <MasterLayout>
      <Breadcrumb heading="Payment Managment System" title="Payment Managment System" />
      <PaymentTransactionsTable />
    </MasterLayout>
  )
}

export default function PaymentTransactionsPage() {
  return <RBACWrapper>{() => <PaymentTransactionsContent />}</RBACWrapper>
}
