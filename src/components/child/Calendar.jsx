import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "@/helper/axiosSetup";
import { convertUTCTo12Hour } from "@/helper/DateTime";

export default function ProfessionalCalendar() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const getCalendarEvents = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/`
      );
      if (response.status == 200) {
        setAppointments(response?.data?.appointments);
        console.log("Get appointments success", response.data.appointments);
      }
    } catch (error) {
      console.log("error to get appointments", error.response.error);
    }
  };

  useEffect(() => {
    getCalendarEvents();
  }, []);

  useEffect(() => {
    // Group appointments by time slot
    const groupedEvents = appointments.reduce((acc, appt) => {
      const key = `${appt.start_time}_${appt.end_time}`;
      if (!acc[key]) {
        acc[key] = {
          start: appt.start_time,
          end: appt.end_time,
          appointments: [],
        };
      }
      acc[key].appointments.push(appt);
      return acc;
    }, {});

    // Format events for FullCalendar
    const events = Object.values(groupedEvents).map((group) => ({
      start: group.start,
      end: group.end,
      display: "block",
      extendedProps: {
        appointments: group.appointments,
      },
      className: `time-slot-${new Date(group.start).getHours()}`,
    }));

    setCalendarEvents(events);
  }, [appointments]);

  return (
    <div className="professional-calendar-container">
      <div className="calendar-main">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "title",
            right: "prev,next today",
          }}
          initialView={"dayGridMonth"}
          height={"auto"}
          events={calendarEvents}
          eventContent={renderEventContent}
          eventDisplay={"block"}
          nowIndicator={true}
        />
      </div>
    </div>
  );
}

function renderEventContent(eventInfo) {
  const { appointments } = eventInfo.event.extendedProps;

  const timeString = `${convertUTCTo12Hour(
    eventInfo.event.start
  )}-${convertUTCTo12Hour(eventInfo.event.end)}`;

  // Department color mapping
  const departmentColors = {
    PhysicalTherapy: "#4e79a7",
    ABA: "#f28e2b",
    OccupationalTherapy: "#e15759",
    SpecialEducation: "#76b7b2",
    Speech: "#59a14f",
    ay7aga: "#edc948",
  };

  return (
    <div className="professional-event">
      <div className="event-time">{timeString}</div>
      <div className="event-appointments">
        {appointments.map((appt) => (
          <div
            key={appt._id}
            className="appointment-card"
            style={{
              borderLeft: `4px solid ${
                departmentColors[appt.department] || "#999"
              }`,
            }}
          >
            <div className="doctor-name">{appt.doctor.username}</div>
            <div className="department">{appt.department}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
