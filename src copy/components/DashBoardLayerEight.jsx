"use client"
import HomeComOne from "./child/HomeComOne"
import HomeComTo from "./child/HomeComTo"
import HomeComThree from "./child/HomeComThree"
import HomeComFour from "./child/HomeComFour"
import HomeComSix from "./child/HomeComSix"
import styles from "@/styles/home-components.module.css"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

const DashBoardLayerEight = () => {
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const decodedToken = jwtDecode(token)
          setUserRole(decodedToken.role)
        } catch (error) {
          console.error("Error decoding token:", error)
          setUserRole(null)
        }
      }
    }
  }, [])

  const isHeadDoctor = userRole === "HeadDoctor"

  return (
    <div className={styles.dashboardContainer}>
      {/* Statistics Cards Row (HomeComOne) - Now always shows 3 cards in a row, taking full width */}
      <div className={`${styles.gridRow} ${styles.gap4} ${styles.marginBottom4}`}>
        <HomeComOne isHeadDoctor={isHeadDoctor} />
      </div>

      {/* Charts Row 1 (HomeComFour and HomeComThree) - Side-by-side with same height */}
      <div className={`${styles.gridRow} ${styles.gap4} ${styles.marginBottom4} ${styles.equalHeightRow}`}>
        {!isHeadDoctor && (
          <div
            className={`${styles.gridCol} ${styles.equalHeightCol} ${styles.colXl7} ${styles.colLg6} ${styles.colMd6} ${styles.colSm12}`}
          >
            <HomeComFour />
          </div>
        )}
        <div
          className={`${styles.gridCol} ${styles.equalHeightCol} ${isHeadDoctor ? styles.col12 : `${styles.colXl5} ${styles.colLg6} ${styles.colMd6} ${styles.colSm12}`}`}
        >
          <HomeComThree />
        </div>
      </div>

      {/* Chart Row 2 (HomeComTo) - Now takes full width */}
      <div className={`${styles.gridRow} ${styles.gap4} ${styles.marginBottom4}`}>
        <div className={`${styles.gridCol} ${styles.col12}`}>
          <HomeComTo />
        </div>
      </div>

      {/* Chart Row 3 (HomeComSix) - Moved to its own full-width row */}
      <div className={`${styles.gridRow} ${styles.gap4} ${styles.marginBottom4}`}>
        <div className={`${styles.gridCol} ${styles.col12}`}>
          <HomeComSix />
        </div>
      </div>
    </div>
  )
}

export default DashBoardLayerEight
