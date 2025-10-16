import axiosInstance from "./axiosSetup"

export const sendEmail = async ({ to, filePath, subject, text }) => {
  try {
    // Send the form data to your server
    const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/email/send-email`, {
      to,
      filePath,
      subject,
      text,
    })
    console.log("email send successfully ", response.data)
  } catch (error) {
    console.log("Error while send email", error)
  }
}

export const sendNotification = async ({
  isList,
  receiverIds,
  rule,
  receiverId,
  title,
  titleAr,
  message,
  messageAr,
  type,
}) => {
  try {
    let response
    if (isList) {
      response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/notification/send`, {
        receiverIds,
        rule,
        title,
        titleAr,
        message,
        messageAr,
        type,
      })
    } else {
      // Send the form data to your server
      response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/notification/send`, {
        receiverId,
        rule,
        title,
        titleAr,
        message,
        messageAr,
        type,
      })
    }
    console.log("Notification send successfully", response.data)
  } catch (error) {
    console.log("Error while send notification", error)
  }
}
// </CHANGE>
