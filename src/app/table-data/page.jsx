"use client"
import { useState } from "react"
import Breadcrumb from "@/components/Breadcrumb"
import PaymentEdit from "@/components/PaymentEdit"
import MasterLayout from "@/masterLayout/MasterLayout"

const Page = () => {
  const [language, setLanguage] = useState("en")

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"))
  }

  const breadcrumbData = {
    en: {
      heading: "Edit Payment Transactions",
      title: "Dashboard / Edit Payment",
    },
    ar: {
      heading: "تعديل معاملات الدفع",
      title: "لوحة التحكم / تعديل الدفع",
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

        {/* PaymentEdit Component */}
        <PaymentEdit language={language} />
      </MasterLayout>
    </>
  )
}

export default Page
