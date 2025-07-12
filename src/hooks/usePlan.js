"use client"

import { useState, useEffect, useCallback } from "react"
import axiosInstance from "@/helper/axiosSetup"

const usePlan = (patientId, department) => {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlan = useCallback(async () => {
    if (!patientId || !department) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/${department}/plan/${patientId}`)
      setPlan(response.data)
    } catch (err) {
      console.error(`Error fetching ${department} plan for patient ${patientId}:`, err)
      setError(err)
      setPlan(null) // Ensure plan is null on error
    } finally {
      setLoading(false)
    }
  }, [patientId, department])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  return { plan, loading, error, refetchPlan: fetchPlan }
}

export default usePlan
