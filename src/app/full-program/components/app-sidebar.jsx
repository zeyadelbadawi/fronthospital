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
    id: "New-Evaulations-Appointments",
    name: "New Evaulations Appointments",
    icon: Calendar,
    items: [
    { id: "New-Evaulations", name: "Upcoming Evaulations", type: "upcoming-Evaulations" },
        { id: "COMPLETE-Evaulations", name: "COMPLETE Evaulations", type: "COMPLETE-Evaulations" },
      { id: "speech-appointments", name: "Add More Appointments", type: "appointments" },

    ],
  },
  {
    id: "physical-therapy",
    name: "Physical Therapy",
    icon: Activity,
    items: [
      { id: "physical-therapy-assign", name: "Assign Patient", type: "assign-patient" },
<<<<<<< Updated upstream
      { id: "physical-therapy-patients", name: "Patients", type: "patients" },
=======
      { id: "physical-therapy-patients", name: "Students", type: "patients" },
      {},
>>>>>>> Stashed changes
    ],
  },
  {
    id: "aba",
    name: "ABA",
    icon: Brain,
    items: [
      { id: "aba-assign", name: "Assign Patient", type: "assign-patient" },
      { id: "aba-patients", name: "Patients", type: "patients" },
    ],
  },
  {
    id: "occupational-therapy",
    name: "Occupational Therapy",
    icon: Hand,
    items: [
      { id: "occupational-therapy-assign", name: "Assign Patient", type: "assign-patient" },
      { id: "occupational-therapy-patients", name: "Patients", type: "patients" },
    ],
  },
  {
    id: "special-education",
    name: "Special Education",
    icon: GraduationCap,
    items: [
      { id: "special-education-assign", name: "Assign Patient", type: "assign-patient" },
      { id: "special-education-patients", name: "Patients", type: "patients" },
    ],
  },
  {
    id: "speech",
    name: "Speech",
    icon: MessageSquare,
    items: [
      { id: "speech-assign", name: "Assign Patient", type: "assign-patient" },
      { id: "speech-patients", name: "Patients", type: "patients" },
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
        <h5 className={styles.sidebarTitle}>Departments</h5>
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
