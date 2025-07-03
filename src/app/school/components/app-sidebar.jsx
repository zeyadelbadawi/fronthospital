"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from "./ui/sidebar"
import {
  ChevronDown,
  Users,
  UserPlus,
  Activity,
  Brain,
  Hand,
  GraduationCap,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { useContentStore } from "../store/content-store"
import styles from "../styles/sidebar.module.css"

const departments = [
 
  {
    id: "school-up",
    name: "School Evaulation Appointments",
    icon: MessageSquare,
    items: [
      { id: "Up-appointments", name: "All Appointments", type: "appointments" },
      ,
    ],
  },

  {
    id: "school-p",
    name: "School Evaulation Students",
    icon: MessageSquare,
    items: [
      { id: "School-patients", name: "All Students", type: "patients" },
    ],
  },

]



export function AppSidebar() {
  const [openSections, setOpenSections] = useState([])
  const setActiveContent = useContentStore((state) => state.setActiveContent)

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId)
      } else {
        return [...prev, sectionId]
      }
    })
  }

  const handleItemClick = (departmentId, itemType) => {
    setActiveContent({
      department: departmentId,
      type: itemType,
    })
  }

  return (
    <Sidebar className={styles.customSidebar}>
      <SidebarHeader className={styles.sidebarHeader}>
        <h5 className={styles.sidebarTitle}></h5>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {departments.map((department) => {
                const isOpen = openSections.includes(department.id)

                return (
                  <SidebarMenuItem key={department.id}>
                    <SidebarMenuButton
                      className={styles.sidebarMenuButton}
                      onClick={() => toggleSection(department.id)}
                    >
                      <department.icon className={styles.sidebarIcon} />
                      <span>{department.name}</span>
                      <ChevronDown className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ""}`} />
                    </SidebarMenuButton>

                    {isOpen && (
                      <div className={styles.subMenuContainer}>
                        <SidebarMenuSub>
                          {department.items.map((item) => (
                            <SidebarMenuSubItem key={item.id}>
                              <SidebarMenuSubButton
                                onClick={() => handleItemClick(department.id, item.type)}
                                className={styles.sidebarSubButton}
                              >
                                {item.type === "assign-patient" ? (
                                  <UserPlus className={styles.sidebarSubIcon} />
                                ) : item.type === "appointments" ? (
                                  <Calendar className={styles.sidebarSubIcon} />
                                ) : (
                                  <Users className={styles.sidebarSubIcon} />
                                )}
                                <span>{item.name}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </div>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
