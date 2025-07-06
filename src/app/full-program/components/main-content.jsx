"use client";

<<<<<<< Updated upstream
import { SidebarInset, useSidebar } from "./ui/sidebar"
import { useContentStore } from "../store/content-store"
import { AssignPatientsToPhysicalTherapy } from "./assign-patients-physical-therapy"
import { AssignPatientsToAba } from "./assign-patients-aba"
import { AssignPatientsToOccupationalTherapy } from "./AssignTo-OccupationalTherapy"
import { AssignPatientsToSpecialEducation } from "./assign-patients-Special-Education"
import { AssignPatientsToSpeech } from "./assign-patients-speech"
import { SpeechAppointments } from "./speech-appointments"
import { SpeechUpcomingAppointments } from "./speech-upcoming-appointments"
import { useEffect, useState } from "react"
import { SpeechAppointmentCompletion } from "./speech-appointment-completion"
=======
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
import { DoctorAppointments } from "./doctor-appointments";
import { AccountantAppointments } from "./accountant-appointments";
>>>>>>> Stashed changes

import AllPatientsPhysicalTherapy from "./all-patients-physical-therapy";
import AllPatientsOccupationalTherapy from "./all-patients-occupational-therapy";
import AllPatientsSpecialEducation from "./all-patients-Special-Education";
import AllPatientsSpeech from "./all-patients-speech";

<<<<<<< Updated upstream


import { PatientsView } from "./patients-view"
import { WelcomeView } from "./welcome-view"
import styles from "../styles/main-content.module.css"
import AllPatientsAba from "./all-patients-aba"
=======
import { WelcomeView } from "./welcome-view";
import styles from "../styles/main-content.module.css";
import AllPatientsAba from "./all-patients-aba";
import axiosInstance from "@/helper/axiosSetup";
>>>>>>> Stashed changes

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
        type === "plan" &&
        user?.role === "doctor" &&
        doctorDepartment?.includes("Physical Therapy")
      ) {
        return <SpeechAppointmentCompletion />;
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
<<<<<<< Updated upstream
      else if (type === "COMPLETE-Evaulations") {
        return <SpeechAppointmentCompletion appointmentId={activeContent.appointmentId} />
      }else if (type === "appointments") {
        return <SpeechAppointments />
      }
      
 
=======
>>>>>>> Stashed changes
    }

    return <WelcomeView />;
  };

  return (
    <SidebarInset className={styles.mainContent}>
<<<<<<< Updated upstream
      <header className={styles.mainHeader}>
        <div className={styles.headerTitle}>
          <h5>
            Full Program Management
          </h5>
        </div>
      </header>
=======
>>>>>>> Stashed changes
      <main className={styles.mainBody}>{renderContent()}</main>
    </SidebarInset>
  );
}
