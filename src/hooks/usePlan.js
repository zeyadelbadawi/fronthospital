import { useState, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";

const usePlan = (patientId) => {
  const [plan, setPlan] = useState({
    title: "",
    filePath: "",
    fileName: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/aba/plan/${patientId}`
        );
        setPlan(response.data || { title: "", filePath: "", fileName: "" });
      } catch (error) {
        console.error("Error fetching plan:", error);
        setPlan({ title: "", filePath: "", fileName: "" }); // fallback to empty plan
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [patientId]);

  return { plan, loading };
};

export default usePlan;
