import { SidebarProvider } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { MainContent } from "./components/main-content"
import MasterLayout from "@/masterLayout/MasterLayout";

import "./globals.css"
import styles from "./styles/globals.module.css"

export default function FullProgramPage() {
  return (
      <>

          <MasterLayout>

    <div className={styles.appContainer}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <MainContent />
      </SidebarProvider>
    </div>
              </MasterLayout>
    </>
  )
}
