"use client"

import { use } from "react"
import RBACWrapper from "@/components/RBACWrapper"
import ListPageContent from "./listPageContent"

export default function ListPage({ params }) {
  const awaitedParams = use(params)
  const role = awaitedParams.role

  return (
    <RBACWrapper>
      <ListPageContent role={role} />
    </RBACWrapper>
  )
}
