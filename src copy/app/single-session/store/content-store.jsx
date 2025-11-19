"use client"

import { create } from "zustand"

const useContentStore = create((set) => ({
  activeContent: null,
  setActiveContent: (content) => set({ activeContent: content }),
}))

export { useContentStore }
