"use client"

import { createContext, useContext, useState, useCallback } from "react"
import styles from "../../styles/sidebar-ui.module.css"

// Sidebar Context
const SidebarContext = createContext(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Sidebar Provider
export function SidebarProvider({ children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const [openMobile, setOpenMobile] = useState(false)

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const value = {
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  }

  return (
    <SidebarContext.Provider value={value}>
      <div className={styles.sidebarProvider}>{children}</div>
    </SidebarContext.Provider>
  )
}

// Sidebar Components
export function Sidebar({ children, className = "" }) {
  const { open } = useSidebar()

  return <div className={`${styles.sidebar} ${open ? styles.open : styles.closed} ${className}`}>{children}</div>
}

export function SidebarHeader({ children, className = "" }) {
  return <div className={`${styles.sidebarHeader} ${className}`}>{children}</div>
}

export function SidebarContent({ children, className = "" }) {
  return <div className={`${styles.sidebarContent} ${className}`}>{children}</div>
}

export function SidebarGroup({ children, className = "" }) {
  return <div className={`${styles.sidebarGroup} ${className}`}>{children}</div>
}

export function SidebarGroupLabel({ children, className = "" }) {
  return <div className={`${styles.sidebarGroupLabel} ${className}`}>{children}</div>
}

export function SidebarGroupContent({ children, className = "" }) {
  return <div className={`${styles.sidebarGroupContent} ${className}`}>{children}</div>
}

export function SidebarMenu({ children, className = "" }) {
  return <ul className={`${styles.sidebarMenu} ${className}`}>{children}</ul>
}

export function SidebarMenuItem({ children, className = "" }) {
  return <li className={`${styles.sidebarMenuItem} ${className}`}>{children}</li>
}

export function SidebarMenuButton({ children, className = "", onClick, ...props }) {
  return (
    <button className={`${styles.sidebarMenuButton} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export function SidebarMenuSub({ children, className = "" }) {
  return <ul className={`${styles.sidebarMenuSub} ${className}`}>{children}</ul>
}

export function SidebarMenuSubItem({ children, className = "" }) {
  return <li className={`${styles.sidebarMenuSubItem} ${className}`}>{children}</li>
}

export function SidebarMenuSubButton({ children, className = "", onClick, ...props }) {
  return (
    <button className={`${styles.sidebarMenuSubButton} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export function SidebarInset({ children, className = "" }) {
  return <div className={`${styles.sidebarInset} ${className}`}>{children}</div>
}

export function SidebarTrigger({ className = "" }) {
  const { toggleSidebar } = useSidebar()

  return (
    <button className={`${styles.sidebarTrigger} ${className}`} onClick={toggleSidebar}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  )
}
