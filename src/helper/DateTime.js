const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const generateTimeString = (time, day) => {
  // Get today's date in UTC
  const today = new Date();
  const currentDayIndex = today.getUTCDay(); // Use UTC day
  const targetDayIndex = daysOfWeek.indexOf(day);

  // Calculate days until target day
  let daysUntilTarget = (targetDayIndex + 1 - currentDayIndex + 7) % 7; // +1 because Sunday=0 in getUTCDay but Sunday is last in our array
  if (daysUntilTarget === 0) daysUntilTarget = 7;

  // Create target date in UTC
  const targetDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + daysUntilTarget
    )
  );

  // Parse the time (e.g., "09:30" or "13:45")
  const [hours, minutes] = time
    .split(":")
    .map((num) => Number.parseInt(num, 10));

  // Set the time in UTC
  targetDate.setUTCHours(hours, minutes || 0, 0, 0);

  return targetDate.toISOString();
};

export function convertUTCTo12Hour(utcTimestamp) {
  const date = new Date(utcTimestamp);

  // Get UTC hours and minutes (no timezone conversion)
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Convert to 12-hour format
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedHour = hour12.toString().padStart(2, "0");
  const formattedMinute = minutes.toString().padStart(2, "0");

  return `${formattedHour}:${formattedMinute} ${ampm}`;
}

export function convertUTCTo24Hour(utcTimestamp) {
  const date = new Date(utcTimestamp);

  // Get UTC hours and minutes (no timezone conversion)
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Convert to 12-hour format
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours  : hours;
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedHour = hour12.toString().padStart(2, "0");
  const formattedMinute = minutes.toString().padStart(2, "0");

  return `${formattedHour}:${formattedMinute} ${ampm}`;
}