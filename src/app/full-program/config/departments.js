export const DEPARTMENTS = {
  ABA: {
    name: "ABA",
    displayName: "ABA",
    fullName: "Applied Behavior Analysis",
    apiEndpoint: "/aba",
    doctorDepartment: "ABA",
    loadingText: "Loading your ABA students...",

  },
  SPEECH: {
    name: "Speech",
    displayName: "Speech",
    fullName: "Speech Therapy",
    apiEndpoint: "/speech",
    doctorDepartment: "speech",
    loadingText: "Loading your Speech students...",

  },
  PHYSICAL_THERAPY: {
    name: "PhysicalTherapy",
    displayName: "Physical Therapy",
    fullName: "Physical Therapy",
    apiEndpoint: "/physicalTherapy",
    doctorDepartment: "physicalTherapy",
    loadingText: "Loading your Physical Therapy students...",

  },
  OCCUPATIONAL_THERAPY: {
    name: "OccupationalTherapy",
    displayName: "Occupational Therapy",
    fullName: "Occupational Therapy",
    apiEndpoint: "/OccupationalTherapy",
    doctorDepartment: "OccupationalTherapy",
    loadingText: "Loading your Occupational Therapy students...",

  },
  SPECIAL_EDUCATION: {
    name: "SpecialEducation",
    displayName: "Special Education",
    fullName: "Special Education",
    apiEndpoint: "/SpecialEducation",
    doctorDepartment: "SpecialEducation",
    loadingText: "Loading your Special Education students...",

  },
}

// Helper function to get department by content type
export const getDepartmentByContentType = (contentType) => {
  const departmentMap = {
    "all-patients-aba": DEPARTMENTS.ABA,
    "all-patients-speech": DEPARTMENTS.SPEECH,
    "all-patients-physical-therapy": DEPARTMENTS.PHYSICAL_THERAPY,
    "all-patients-occupational-therapy": DEPARTMENTS.OCCUPATIONAL_THERAPY,
    "all-patients-special-education": DEPARTMENTS.SPECIAL_EDUCATION,
  }

  return departmentMap[contentType]
}
