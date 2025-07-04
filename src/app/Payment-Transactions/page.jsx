"use client"
import { useState } from "react"
import Breadcrumb from "@/components/Breadcrumb"
import PaymentTransactionsTable from "@/components/PaymentTransactionsTable"
import MasterLayout from "@/masterLayout/MasterLayout"

const Page = () => {
  const [language, setLanguage] = useState("en")

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"))
  }

  const breadcrumbData = {
    en: {
      heading: "All Payment Transactions",
      title: "Dashboard / All Payment Transactions",
    },
    ar: {
      heading: "جميع معاملات الدفع",
      title: "لوحة التحكم / جميع معاملات الدفع",
    },
  }

  return (
    <>
      <MasterLayout>
        {/* Language Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-outline-primary d-flex align-items-center" onClick={toggleLanguage}>
            <i className={`fas fa-language me-2`}></i>
            {language === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb heading={breadcrumbData[language].heading} title={breadcrumbData[language].title} />
        <PaymentTransactionsTable language={language} />

        {/* PaymentTransactionsTable Component */}
      </MasterLayout>
    </>
  )
}

export default Page
