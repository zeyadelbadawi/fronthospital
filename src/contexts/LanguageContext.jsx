"use client"
import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

const translations = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
    },
    welcome: {
      title: "Welcome to Your Health Portal",
      subtitle:
        "Access your appointments, medical records, and manage your healthcare journey with ease and confidence",
    },
    disclaimer: {
      title: "Important Information",
      lines: [
        "PLEASE NOTE THAT THIS IS NOT AN EMERGENCY SERVICE.",
        "In case of an emergency, call 999 (police), 998 (ambulance), or go to the nearest A&E facility.",
        "If you are unable to attend or wish to reschedule, please provide at least 24 hours' notice; otherwise a cancellation fee may apply.",
        "All correspondence is confidential. Please do not disclose your appointment or personal information outside this office.",
        "For in-person appointments, arrive 15 minutes early to complete any necessary paperwork.",
        "If you have insurance, bring your policy details (insurer name, policy number, subscriber ID).",
        "For telemedicine, ensure you have a stable internet connection, a compatible device, and a quiet private space.",
      ],
    },
    services: {
      bookAppointment: {
        title: "Book Appointment",
        description: "Schedule your next appointment with our specialists",
      },
      myProfile: {
        title: "My Profile",
        description: "View and update your personal information",
      },
      myAppointments: {
        title: "My Appointments",
        description: "View your upcoming and past appointments",
      },
      myInvoices: {
        title: "My Invoices",
        description: "Access your billing information and payment history",
      },
    },
    auth: {
      welcomeBack: "Welcome Back",
      createAccount: "Create Account",
      email: "Email Address",
      password: "Password",
      fullName: "Full Name",
      phone: "Phone Number",
      gender: "Gender",
      confirmPassword: "Confirm Password",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      fullNamePlaceholder: "Enter your full name",
      phonePlaceholder: "Enter your phone number",
      createPasswordPlaceholder: "Create a strong password",
      confirmPasswordPlaceholder: "Confirm your password",
      selectGender: "Select gender",
      male: "Male",
      female: "Female",
      rememberMe: "Remember me for 30 days",
      signIn: "Sign In",
      signingIn: "Signing In...",
      creatingAccount: "Creating Account...",
      noAccount: "Don't have an account? Create one here",
      haveAccount: "Already have an account? Sign in here",
    },
    validation: {
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters",
      invalidName: "Name must contain only letters and be at least 2 characters",
      invalidPhone: "Please enter a valid phone number",
      weakPassword: "Password must be at least 8 characters with uppercase, lowercase, and number",
      passwordMismatch: "Passwords do not match",
      validEmail: "Valid email address",
      validName: "Valid name",
      validPhone: "Valid phone number",
      passwordsMatch: "Passwords match",
    },
    messages: {
      logoutSuccess: "Logged out successfully",
      loginSuccess: "Welcome back! Login successful",
      loginFailed: "Login failed",
      signupSuccess: "Registration successful! Please log in with your credentials",
      signupFailed: "Registration failed",
      fixErrors: "Please fix the errors before submitting",
      selectGender: "Please select your gender",
    },
    wizard: {
      bookAppointment: "Book Your Appointment",
      selectEvaluationType: "Select Evaluation Type",
      chooseEvaluationType: "Choose the type of evaluation that best suits your needs",
      evaluationType: "Evaluation Type",
      chooseYourEvaluationType: "Choose your evaluation type...",
      schoolEvaluation: "School Evaluation",
      fullPackageEvaluation: "Full Package Evaluation",
      alreadyActive: "(Already Active)",
      singleSession: "Single Session",
      continue: "Continue →",
      requestEvaluation: "Request Evaluation",
      scheduleAppointment: "Schedule Your Appointment",
      selectPreferredDateTime: "Select your preferred date, time, and provide details",
      selectDay: "Select Day",
      chooseDate: "Choose a date",
      selectTime: "Select Time",
      chooseTime: "Choose a time",
      selectedTime: "Selected time:",
      description: "Description",
      descriptionPlaceholder: "Please describe your needs or any specific requirements...",
      selectServices: "Select Services",
      chooseServices: "Choose your services...",
      selectedServicesTotal: "Selected Services Total:",
      back: "← Back",
      wordDocument: "Word Document",
      reviewEditDocument: "Review & Edit Document",
      reviewCustomizeDocument: "Review and customize your treatment plan document",
      proceedToPayment: "Proceed to Payment →",
      payment: "Payment",
      completePayment: "Complete Payment",
      securePaymentProcessing: "Secure payment processing for your appointment",
      paymentSummary: "Payment Summary",
      fullProgramTotal: "Full Program Total:",
      initialPaymentToday: "Initial Payment (Today):",
      remainingAfterConsultation: "Remaining (After Consultation):",
      payingNow: "Paying Now:",
      paymentNote: "You'll complete the remaining payment after your consultation with the doctor.",
      programFee: "Program Fee:",
      additionalServices: "Additional Services:",
      totalAmount: "Total Amount:",
      completePaymentButton: "💳 Complete Payment",
      processing: "Processing...",
      securePayment: "Secure payment processing • SSL encrypted",
      complete: "Complete",
      congratulations: "Congratulations!",
      appointmentBooked: "Your appointment has been successfully booked at Rukn Elwatikon Rehabilitation Center.",
      schoolEvaluationAssigned: " You have been assigned to our school evaluation program.",
      serviceAssignments: "Service Assignments",
      assignedToServices: "You have been automatically assigned to {count} service(s).",
      whatsNext: "What's Next?",
      nextSteps: [
        "• You'll receive a confirmation email shortly",
        "• Our team will contact you 24 hours before your appointment",
        "• Please arrive 15 minutes early",
        "• You can now access the school evaluation portal",
        "• You can view your service assignments in the respective department portals",
      ],
      validation: {
        selectEvaluationType: "Please select an evaluation type",
        selectDate: "Please select a date",
        selectTime: "Please select a time",
        provideDescription: "Please provide a description",
        selectAtLeastOneService: "Please select at least one service",
      },
    },
  },
  ar: {
    common: {
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
    },
    welcome: {
      title: "مرحباً بك في بوابة الصحة الخاصة بك",
      subtitle: "الوصول إلى مواعيدك والسجلات الطبية إدارة رحلتك الصحية بسهولة وثقة",
    },
    disclaimer: {
      title: "معلومات مهمة",
      lines: [
        "يرجى ملاحظة أن هذه ليست خدمة طوارئ.",
        "في حالة الطوارئ، اتصل بـ 999 (الشرطة)، 998 (الإسعاف)، أو اذهب إلى أقرب قسم طوارئ.",
        "إذا لم تتمكن من الحضور أو ترغب في إعادة الجدولة، يرجى تقديم إشعار مسبق لمدة 24 ساعة على الأقل؛ وإلا فقد يتم تطبيق رسوم إلغاء.",
        "جميع المراسلات سرية. يرجى عدم الكشف عن موعدك أو معلوماتك الشخصية خارج هذا المكتب.",
        "للمواعيد الشخصية، احضر قبل 15 دقيقة لإكمال أي أوراق ضرورية.",
        "إذا كان لديك تأمين، أحضر تفاصيل بوليصتك (اسم شركة التأمين، رقم البوليصة، معرف المشترك).",
        "للطب عن بُعد، تأكد من وجود اتصال إنترنت مستقر وجهاز متوافق ومساحة هادئة وخاصة.",
      ],
    },
    services: {
      bookAppointment: {
        title: "حجز موعد",
        description: "جدولة موعدك القادم مع أخصائيينا",
      },
      myProfile: {
        title: "ملفي الشخصي",
        description: "عرض وتحديث معلوماتك الشخصية",
      },
      myAppointments: {
        title: "مواعيدي",
        description: "عرض مواعيدك القادمة والسابقة",
      },
      myInvoices: {
        title: "فواتيري",
        description: "الوصول إلى معلومات الفوترة وتاريخ الدفع",
      },
    },
    auth: {
      welcomeBack: "مرحباً بعودتك",
      createAccount: "إنشاء حساب",
      email: "عنوان البريد الإلكتروني",
      password: "كلمة المرور",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      gender: "الجنس",
      confirmPassword: "تأكيد كلمة المرور",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      passwordPlaceholder: "أدخل كلمة المرور",
      fullNamePlaceholder: "أدخل اسمك الكامل",
      phonePlaceholder: "أدخل رقم هاتفك",
      createPasswordPlaceholder: "أنشئ كلمة مرور قوية",
      confirmPasswordPlaceholder: "أكد كلمة المرور",
      selectGender: "اختر الجنس",
      male: "ذكر",
      female: "أنثى",
      rememberMe: "تذكرني لمدة 30 يوماً",
      signIn: "تسجيل الدخول",
      signingIn: "جاري تسجيل الدخول...",
      creatingAccount: "جاري إنشاء الحساب...",
      noAccount: "ليس لديك حساب؟ أنشئ واحداً هنا",
      haveAccount: "لديك حساب بالفعل؟ سجل دخولك هنا",
    },
    validation: {
      invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صحيح",
      passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      invalidName: "يجب أن يحتوي الاسم على أحرف فقط ولا يقل عن حرفين",
      invalidPhone: "يرجى إدخال رقم هاتف صحيح",
      weakPassword: "يجب أن تكون كلمة المرور 8 أحرف على الأقل مع أحرف كبيرة وصغيرة ورقم",
      passwordMismatch: "كلمات المرور غير متطابقة",
      validEmail: "عنوان بريد إلكتروني صحيح",
      validName: "اسم صحيح",
      validPhone: "رقم هاتف صحيح",
      passwordsMatch: "كلمات المرور متطابقة",
    },
    messages: {
      logoutSuccess: "تم تسجيل الخروج بنجاح",
      loginSuccess: "مرحباً بعودتك! تم تسجيل الدخول بنجاح",
      loginFailed: "فشل تسجيل الدخول",
      signupSuccess: "تم التسجيل بنجاح! يرجى تسجيل الدخول باستخدام بياناتك",
      signupFailed: "فشل التسجيل",
      fixErrors: "يرجى إصلاح الأخطاء قبل الإرسال",
      selectGender: "يرجى اختيار الجنس",
    },
    wizard: {
      bookAppointment: "احجز موعدك",
      selectEvaluationType: "اختر نوع التقييم",
      chooseEvaluationType: "اختر نوع التقييم الذي يناسبك",
      evaluationType: "نوع التقييم",
      chooseYourEvaluationType: "اختر نوع التقييم...",
      schoolEvaluation: "تقييم مدرسي",
      fullPackageEvaluation: "تقييم الحزمة الكاملة",
      alreadyActive: "(نشط بالفعل)",
      singleSession: "جلسة واحدة",
      continue: "متابعة ←",
      requestEvaluation: "طلب التقييم",
      scheduleAppointment: "جدولة موعدك",
      selectPreferredDateTime: "اختر التاريخ والوقت المفضل وقدم التفاصيل",
      selectDay: "اختر اليوم",
      chooseDate: "اختر تاريخاً",
      selectTime: "اختر الوقت",
      chooseTime: "اختر وقتاً",
      selectedTime: "الوقت المحدد:",
      description: "الوصف",
      descriptionPlaceholder: "يرجى وصف احتياجاتك أو أي متطلبات خاصة...",
      selectServices: "اختر الخدمات",
      chooseServices: "اختر خدماتك...",
      selectedServicesTotal: "إجمالي الخدمات المحددة:",
      back: "→ رجوع",
      wordDocument: "مستند وورد",
      reviewEditDocument: "مراجعة وتحرير المستند",
      reviewCustomizeDocument: "راجع وخصص مستند خطة العلاج الخاصة بك",
      proceedToPayment: "← المتابعة للدفع",
      payment: "الدفع",
      completePayment: "إتمام الدفع",
      securePaymentProcessing: "معالجة دفع آمنة لموعدك",
      paymentSummary: "ملخص الدفع",
      fullProgramTotal: "إجمالي البرنامج الكامل:",
      initialPaymentToday: "الدفعة الأولى (اليوم):",
      remainingAfterConsultation: "المتبقي (بعد الاستشارة):",
      payingNow: "الدفع الآن:",
      paymentNote: "ستكمل الدفع المتبقي بعد استشارتك مع الطبيب.",
      programFee: "رسوم البرنامج:",
      additionalServices: "خدمات إضافية:",
      totalAmount: "المبلغ الإجمالي:",
      completePaymentButton: "💳 إتمام الدفع",
      processing: "جاري المعالجة...",
      securePayment: "معالجة دفع آمنة • مشفرة بـ SSL",
      complete: "مكتمل",
      congratulations: "تهانينا!",
      appointmentBooked: "تم حجز موعدك بنجاح في مركز ركن الواتيكون للتأهيل.",
      schoolEvaluationAssigned: " تم تعيينك في برنامج التقييم المدرسي.",
      serviceAssignments: "تعيينات الخدمة",
      assignedToServices: "تم تعيينك تلقائياً في {count} خدمة/خدمات.",
      whatsNext: "ما التالي؟",
      nextSteps: [
        "• ستتلقى بريداً إلكترونياً للتأكيد قريباً",
        "• سيتصل بك فريقنا قبل 24 ساعة من موعدك",
        "• يرجى الوصول قبل 15 دقيقة",
        "• يمكنك الآن الوصول إلى بوابة التقييم المدرسي",
        "• يمكنك عرض تعيينات الخدمة في بوابات الأقسام المعنية",
      ],
      validation: {
        selectEvaluationType: "يرجى اختيار نوع التقييم",
        selectDate: "يرجى اختيار التاريخ",
        selectTime: "يرجى اختيار الوقت",
        provideDescription: "يرجى تقديم وصف",
        selectAtLeastOneService: "يرجى اختيار خدمة واحدة على الأقل",
      },
    },
  },
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("ar") // Changed default to Arabic

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    } else {
      // Set Arabic as default if no saved language
      setLanguage("ar")
      localStorage.setItem("language", "ar")
    }
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en"
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
