import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar({ evaluations }) {
  const [calendarEvents, setCalendarEvents] = useState([])

  // Convert the evaluations to FullCalendar event format
  useEffect(() => {
    if (evaluations && evaluations.length > 0) {
      const events = evaluations.map((evaluation) => {
        // Strip 'patient:' prefix if present in evaluation.title
        const cleanTitle = evaluation.title && evaluation.title.toLowerCase().startsWith('patient:')
          ? evaluation.title.replace(/^patient:\s*/i, '')
          : evaluation.title;
  
        return {
          title: cleanTitle,
          start: evaluation.date,
          end: evaluation.date,
        }
      });
      setCalendarEvents(events);
    }
  }, [evaluations]);
  
  
  return (
    <div className='demo-app'>
      <div className='demo-app-main'>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'title',
            center: 'timeGridDay,timeGridWeek,dayGridMonth',
            right: 'prev,next today',
          }}
          initialView='dayGridMonth'
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents} // Display evaluations as events
          eventContent={renderEventContent}
        />
      </div>
    </div>
  )
}

function renderEventContent(eventInfo) {
  return (
    <>
      <i>{eventInfo.event.title}</i>
    </>
  )
}


