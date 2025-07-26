"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "../helper/axiosSetup";
import "react-datepicker/dist/react-datepicker.css";
import ImprovedCalendar from "./WeekTable";
import Loader from "./Loader";

const CalendarMainLayer = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const getCalendarEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/`
      );
      if (response.status == 200) {
        setIsLoading(false);
        setAppointments(response?.data?.appointments);
        console.log("Get appointments success", response.data.appointments);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("error to get appointments", error.response);
    }
  };

  useEffect(() => {
    getCalendarEvents();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <ImprovedCalendar evaluations={appointments} />
  );
};

export default CalendarMainLayer;