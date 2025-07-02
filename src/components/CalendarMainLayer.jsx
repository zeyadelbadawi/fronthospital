"use client";

import React, { useEffect, useState } from "react";
import Calendar from "./child/Calendar"; // your calendar component
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "../helper/axiosSetup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WeekTable from "./WeekTable";

const CalendarMainLayer = () => {
  return <WeekTable/>;
};

export default CalendarMainLayer;
