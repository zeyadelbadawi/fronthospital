"use client"

import React, { createContext, useContext, useState } from "react"
import styles from "../../styles/collapsible-ui.module.css"

// Collapsible Context
const CollapsibleContext = createContext(null)

export function useCollapsible() {
  const context = useContext(CollapsibleContext)
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible")
  }
  return context
}

// Collapsible Components
export function Collapsible({ children, open: controlledOpen, onOpenChange, defaultOpen = false, className = "" }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (newOpen) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const toggle = () => {
    console.log("Toggle called, current open:", open) // Debug log
    setOpen(!open)
  }

  const value = {
    open,
    setOpen,
    toggle,
  }

  return (
    <CollapsibleContext.Provider value={value}>
      <div className={`${styles.collapsible} ${open ? styles.open : styles.closed} ${className}`}>{children}</div>
    </CollapsibleContext.Provider>
  )
}

export function CollapsibleTrigger({ children, asChild = false, className = "", ...props }) {
  const { toggle } = useCollapsible()

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("CollapsibleTrigger clicked") // Debug log
    toggle()
  }

  if (asChild && children) {
    // Clone the child element and add the onClick handler
    const child = React.Children.only(children)
    return React.cloneElement(child, {
      ...child.props,
      onClick: (e) => {
        if (child.props.onClick) {
          child.props.onClick(e)
        }
        handleClick(e)
      },
      className: `${child.props.className || ""} ${className}`.trim(),
      ...props,
    })
  }

  return (
    <button className={`${styles.collapsibleTrigger} ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

export function CollapsibleContent({ children, className = "" }) {
  const { open } = useCollapsible()

  return (
    <div className={`${styles.collapsibleContent} ${open ? styles.open : styles.closed} ${className}`}>
      <div className={styles.collapsibleContentInner}>{children}</div>
    </div>
  )
}
