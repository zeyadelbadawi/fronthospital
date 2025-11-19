export const generateAppointmentCancellationEmail = ({ patientName, date, time, reason }) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d32f2f;">Appointment Cancelled</h2>
        <p>Dear ${patientName},</p>
        <p>We regret to inform you that your appointment has been cancelled.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ""}
        </div>
        
        <p>If you have any questions or would like to reschedule, please contact us.</p>
        <p>Best regards,<br>Therapy Management Team</p>
      </div>
    `
  }
  
  export const generateAppointmentRescheduleEmail = ({ patientName, oldDate, oldTime, newDate, newTime, reason }) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #ff9800;">Appointment Rescheduled</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been rescheduled to a new date and time.</p>
        
        <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ff9800;">New Appointment Details</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${newDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${newTime}</p>
          ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ""}
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #666;">Previous Appointment</h4>
          <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${oldDate}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${oldTime}</p>
        </div>
        
        <p>Please make note of your new appointment time. If you have any questions, please contact us.</p>
        <p>Best regards,<br>Therapy Management Team</p>
      </div>
    `
  }
  
  export const generateAppointmentCompletionEmail = ({ patientName, date, time, notes }) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4caf50;">Appointment Completed</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been successfully completed.</p>
        
        <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          ${notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${notes}</p>` : ""}
        </div>
        
        <p>Thank you for attending your appointment. If you have any follow-up questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Therapy Management Team</p>
      </div>
    `
  }
  
