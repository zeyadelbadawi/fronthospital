"use client"

import { create } from "zustand"

export const useContentStore = create((set) => ({
  activeContent: null,
  setActiveContent: (content) => set({ activeContent: content }),
  clearActiveContent: () => set({ activeContent: null }),
}))
