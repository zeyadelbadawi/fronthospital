// Frontend utility functions for assignment management

export const notificationsIcons = {
  create: "material-symbols:add-circle-outline",
  update: "mdi:pencil-outline",
  reschedule: "mdi:calendar-clock",
  delete: "material-symbols:delete-outline",
  successfully: "mdi:check-circle-outline",
  unsuccessfully: "mdi:close-circle-outline",
  active: "mdi:toggle-switch",
};

export const formatAssignmentStatus = (status) => {
  const statusMap = {
    active: { label: "Active", color: "blue", icon: "🔵" },
    completed: { label: "Completed", color: "green", icon: "✅" },
    suspended: { label: "Suspended", color: "yellow", icon: "⏸️" },
    cancelled: { label: "Cancelled", color: "red", icon: "❌" },
  };

  return statusMap[status] || { label: "Unknown", color: "gray", icon: "❓" };
};

export const formatServiceName = (serviceName) => {
  const serviceMap = {
    physical_therapy: "Physical Therapy",
    ABA: "ABA",
    occupational_therapy: "Occupational Therapy",
    special_education: "Special Education",
    speech: "Speech Therapy",
  };

  return (
    serviceMap[serviceName] ||
    serviceName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

export const getServiceColor = (serviceName) => {
  const colorMap = {
    physical_therapy: "bg-green-100 text-green-800",
    ABA: "bg-purple-100 text-purple-800",
    occupational_therapy: "bg-orange-100 text-orange-800",
    special_education: "bg-red-100 text-red-800",
    speech: "bg-blue-100 text-blue-800",
  };

  return colorMap[serviceName] || "bg-gray-100 text-gray-800";
};

export const validateAppointmentData = (data) => {
  const errors = {};

  if (!data.patientId) {
    errors.patientId = "Patient ID is required";
  }

  if (!data.date) {
    errors.date = "Date is required";
  } else {
    const appointmentDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      errors.date = "Appointment date cannot be in the past";
    }
  }

  if (!data.time) {
    errors.time = "Time is required";
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Description is required";
  }

  if (
    data.evaluationType === "single_session" &&
    (!data.services || data.services.length === 0)
  ) {
    errors.services =
      "At least one service must be selected for single session";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const calculateTotalPrice = (basePrice, selectedServices) => {
  const servicesTotal = selectedServices.reduce(
    (total, service) => total + (service.price || 0),
    0
  );
  return basePrice + servicesTotal;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDateTime = (date, time) => {
  const appointmentDate = new Date(date);
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${formattedDate} at ${time}`;
};
