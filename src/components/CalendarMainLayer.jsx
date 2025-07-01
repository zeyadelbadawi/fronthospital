"use client";

import React, { useEffect, useState } from "react";
import Calendar from "./child/Calendar"; // your calendar component
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "../helper/axiosSetup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CalendarMainLayer = () => {
  return (
    <div className="col-xxl-9 col-lg-8">
      <div className="card h-100 p-0">
        <div className="card-body p-24">
          <Calendar evaluations={events} />
        </div>
      </div>
    </div>
  );
};

export default CalendarMainLayer;
