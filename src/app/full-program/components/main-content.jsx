"use client";

import { SidebarInset, useSidebar } from "./ui/sidebar";
import { useContentStore } from "../store/content-store";
import { AssignPatientsToPhysicalTherapy } from "./assign-patients-physical-therapy";
import { AssignPatientsToAba } from "./assign-patients-aba";
import { AssignPatientsToOccupationalTherapy } from "./AssignTo-OccupationalTherapy";
import { AssignPatientsToSpecialEducation } from "./assign-patients-Special-Education";
import { AssignPatientsToSpeech } from "./assign-patients-speech";
import { SpeechAppointments } from "./speech-appointments";
import { SpeechUpcomingAppointments } from "./speech-upcoming-appointments";
import { useEffect, useState } from "react";
import { SpeechAppointmentCompletion } from "./speech-appointment-completion";
//import { DoctorAppointments } from "./doctor-appointments";
//import { AccountantAppointments } from "./accountant-appointments";

import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy";
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy";
import AllPatientsSpecialEducation from "./all-patients-Special-Education";
import AllPatientsSpeech from "./all-patients-speech";

import { WelcomeView } from "./welcome-view";
import styles from "../styles/main-content.module.css";
import AllPatientsAba from "./all-patients-aba";
import axiosInstance from "@/helper/axiosSetup";
import DoctorPlan from "./DoctorPlan";

export function MainContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorDepartment, setDoctorDepartment] = useState(null);

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem("token", r.data.accessToken);
          const retry = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`,
            {
              headers: { Authorization: `Bearer ${r.data.accessToken}` },
            }
          );
          setUser(retry.data);
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const fetchDoctorDepartment = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctorFile/doctor-deps/${user?.id}`
      );
      console.log("Doctor Department Response:", response?.data);
      setDoctorDepartment(response?.data);
    } catch (error) {
      console.error("Error fetching doctor department:", error);
    }
  };
  useEffect(() => {
    if (user?.role === "doctor") fetchDoctorDepartment();
  }, [user?.id]);

  console.log("User Profile:", user);

  const getDepartmentIdByName = (name) => {
    const department = doctorDepartment?.find((dept) => dept.name === name);
    console.log("iddddd", department._id);
    return department ? department._id : null;
  };

  /************************************************* */
  const { activeContent } = useContentStore();
  const { setOpen } = useSidebar();
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  useEffect(() => {
    if (activeContent?.type === "upcoming-appointments") {
      setOpen(false); // Hide sidebar for upcoming appointments
    } else {
      setOpen(true); // Show sidebar for other content
    }
  }, [activeContent, setOpen]);

  const renderContent = () => {
    if (!activeContent) {
      return <WelcomeView />;
    }
    const { department, type } = activeContent;

    // Handle Physical Therapy
    if (department === "physical-therapy") {
      if (type === "assign-patient") {
        return <AssignPatientsToPhysicalTherapy />;
      } else if (type === "patients") {
        return <AllPatientsPhysicalTherapy />;
      } else if (
        type === "plans" &&
        user?.role === "doctor" &&
        doctorDepartment?.some((dept) => dept.name === "Physical Therapy")
      ) {
        return (
          <DoctorPlan
            doctorId={user?.id}
            departmentId={getDepartmentIdByName("Physical Therapy")}
          />
        );
      }
    }

    // Handle other departments (you can expand these)
    if (department === "aba") {
      if (type === "assign-patient") {
        return <AssignPatientsToAba />;
      } else if (type === "patients") {
        return <AllPatientsAba />;
      }
    }

    if (department === "occupational-therapy") {
      if (type === "assign-patient") {
        return <AssignPatientsToOccupationalTherapy />;
      } else if (type === "patients") {
        return <AllPatientsOccupationalTherapy />;
      }
    }

    if (department === "special-education") {
      if (type === "assign-patient") {
        return <AssignPatientsToSpecialEducation />;
      } else if (type === "patients") {
        return <AllPatientsSpecialEducation />;
      }
    }

    if (department === "speech") {
      if (type === "assign-patient") {
        return <AssignPatientsToSpeech />;
      } else if (type === "patients") {
        return <AllPatientsSpeech />;
      } else if (type === "appointments") {
        return <SpeechAppointments />;
      }
    }
    if (department === "New-Evaulations-Appointments") {
      if (type === "upcoming-Evaulations") {
        return <SpeechUpcomingAppointments />;
      } else if (type === "doctor") {
        return <DoctorAppointments />;
      } else if (type === "accountant") {
        return <AccountantAppointments />;
      }
    }

    return <WelcomeView />;
  };

  return (
    <SidebarInset className={styles.mainContent}>
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  );
}
