"use client"
import { createContext, useContext, useState, useEffect } from "react"

export const AccountantLanguageContext = createContext()

export const useAccountantLanguage = () => {
  const context = useContext(AccountantLanguageContext)
  if (!context) {
    throw new Error("useAccountantLanguage must be used within an AccountantLanguageProvider")
  }
  return context
}

const translations = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      search: "Search",
      filter: "Filter",
      export: "Export",
      print: "Print",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      add: "Add",
      total: "Total",
      amount: "Amount",
      date: "Date",
      status: "Status",
      actions: "Actions",
    },
    cookies: {
      title: "We use cookies",
      message:
        "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies.",
      accept: "Accept All",
      decline: "Decline",
      learnMore: "Learn More",
    },
    welcome: {
      title: "Financial Management Portal",
      subtitle:
        "Comprehensive financial oversight and payment management system for healthcare operations with advanced reporting and analytics",
    },
    guidelines: {
      title: "Financial Management Guidelines",
      lines: [
        "MAINTAIN ACCURATE FINANCIAL RECORDS and ensure all transactions are properly documented.",
        "VERIFY ALL PAYMENT INFORMATION before processing any financial transactions.",
        "FOLLOW COMPLIANCE REGULATIONS including healthcare billing standards and tax requirements.",
        "SECURE Student FINANCIAL DATA in accordance with HIPAA and privacy regulations.",
        "RECONCILE ACCOUNTS DAILY and report any discrepancies immediately to management.",
        "BACKUP FINANCIAL DATA regularly and maintain proper audit trails for all transactions.",
        "COORDINATE WITH MEDICAL STAFF for billing accuracy and treatment verification.",
        "GENERATE FINANCIAL REPORTS monthly and provide insights for business decision-making.",
      ],
    },
    services: {
      paymentManagement: {
        title: "Payment Management",
        description:
          "Process and track all Student payments, invoices, and financial transactions with detailed reporting",
      },
      checksManagement: {
        title: "Checks Management",
        description: "Monitor check deposits, clearances, and manage installment payment schedules efficiently",
      },
      fullProgramPayment: {
        title: "Full Program Payments",
        description: "Handle comprehensive program payments, subscriptions, and long-term financial commitments",
      },
      myProfile: {
        title: "My Profile",
        description: "Manage your accountant profile, preferences, and access financial dashboard settings",
      },
    },
    auth: {
      welcomeBack: "Welcome Back, Accountant",
      createAccount: "Create Accountant Account",
      email: "Email Address",
      password: "Password",
      name: "Full Name",
      confirmPassword: "Confirm Password",
      emailPlaceholder: "Enter your professional email",
      passwordPlaceholder: "Enter your password",
      namePlaceholder: "Enter your full name",
      createPasswordPlaceholder: "Create a secure password",
      confirmPasswordPlaceholder: "Confirm your password",
      rememberMe: "Remember me for 30 days",
      signIn: "Sign In",
      signingIn: "Signing In...",
      creatingAccount: "Creating Account...",
      noAccount: "Don't have an account? Register here",
      haveAccount: "Already have an account? Sign in here",
    },
    validation: {
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters",
      invalidName: "Name must be at least 2 characters",
      weakPassword: "Password must be at least 8 characters with uppercase, lowercase, and number",
      passwordMismatch: "Passwords do not match",
      validEmail: "Valid email address",
      validName: "Valid name",
      passwordsMatch: "Passwords match",
    },
    messages: {
      logoutSuccess: "Logged out successfully",
      loginSuccess: "Welcome back! Login successful",
      loginFailed: "Login failed. Please check your credentials",
      signupSuccess: "Registration successful! Please log in with your credentials",
      signupFailed: "Registration failed. Please try again",
      fixErrors: "Please fix the errors before submitting",
    },
  },
  ar: {
    common: {
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      search: "بحث",
      filter: "تصفية",
      export: "تصدير",
      print: "طباعة",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      view: "عرض",
      add: "إضافة",
      total: "الإجمالي",
      amount: "المبلغ",
      date: "التاريخ",
      status: "الحالة",
      actions: "الإجراءات",
    },
    cookies: {
      title: "نستخدم ملفات تعريف الارتباط",
      message:
        "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك، وتقديم محتوى مخصص، وتحليل حركة المرور لدينا. بالنقر على 'قبول الكل'، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
      accept: "قبول الكل",
      decline: "رفض",
      learnMore: "معرفة المزيد",
    },
    welcome: {
      title: "بوابة الإدارة المالية",
      subtitle: "نظام شامل للإشراف المالي وإدارة المدفوعات للعمليات الصحية مع تقارير وتحليلات متقدمة",
    },
    guidelines: {
      title: "إرشادات الإدارة المالية",
      lines: [
        "احتفظ بسجلات مالية دقيقة وتأكد من توثيق جميع المعاملات بشكل صحيح.",
        "تحقق من جميع معلومات الدفع قبل معالجة أي معاملات مالية.",
        "اتبع لوائح الامتثال بما في ذلك معايير الفوترة الصحية ومتطلبات الضرائب.",
        "احم البيانات المالية للمرضى وفقاً لقانون HIPAA ولوائح الخصوصية.",
        "قم بتسوية الحسابات يومياً وأبلغ عن أي تناقضات فوراً للإدارة.",
        "اعمل نسخ احتياطية للبيانات المالية بانتظام واحتفظ بمسارات تدقيق مناسبة لجميع المعاملات.",
        "تنسق مع الطاقم الطبي لضمان دقة الفوترة والتحقق من العلاج.",
        "أنشئ تقارير مالية شهرية وقدم رؤى لاتخاذ القرارات التجارية.",
      ],
    },
    services: {
      paymentManagement: {
        title: "إدارة المدفوعات",
        description: "معالجة وتتبع جميع مدفوعات المرضى والفواتير والمعاملات المالية مع تقارير مفصلة",
      },
      checksManagement: {
        title: "إدارة الشيكات",
        description: "مراقبة إيداع الشيكات والمقاصة وإدارة جداول الدفع بالأقساط بكفاءة",
      },
      fullProgramPayment: {
        title: "مدفوعات البرامج الكاملة",
        description: "التعامل مع مدفوعات البرامج الشاملة والاشتراكات والالتزامات المالية طويلة المدى",
      },
      myProfile: {
        title: "ملفي الشخصي",
        description: "إدارة ملف المحاسب الشخصي والتفضيلات والوصول إلى إعدادات لوحة القيادة المالية",
      },
    },
    auth: {
      welcomeBack: "مرحباً بعودتك، محاسب",
      createAccount: "إنشاء حساب محاسب",
      email: "عنوان البريد الإلكتروني",
      password: "كلمة المرور",
      name: "الاسم الكامل",
      confirmPassword: "تأكيد كلمة المرور",
      emailPlaceholder: "أدخل بريدك الإلكتروني المهني",
      passwordPlaceholder: "أدخل كلمة المرور",
      namePlaceholder: "أدخل اسمك الكامل",
      createPasswordPlaceholder: "أنشئ كلمة مرور آمنة",
      confirmPasswordPlaceholder: "أكد كلمة المرور",
      rememberMe: "تذكرني لمدة 30 يوماً",
      signIn: "تسجيل الدخول",
      signingIn: "جاري تسجيل الدخول...",
      creatingAccount: "جاري إنشاء الحساب...",
      noAccount: "ليس لديك حساب؟ سجل هنا",
      haveAccount: "لديك حساب بالفعل؟ سجل دخولك هنا",
    },
    validation: {
      invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صحيح",
      passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      invalidName: "يجب أن يكون الاسم حرفين على الأقل",
      weakPassword: "يجب أن تكون كلمة المرور 8 أحرف على الأقل مع أحرف كبيرة وصغيرة ورقم",
      passwordMismatch: "كلمات المرور غير متطابقة",
      validEmail: "عنوان بريد إلكتروني صحيح",
      validName: "اسم صحيح",
      passwordsMatch: "كلمات المرور متطابقة",
    },
    messages: {
      logoutSuccess: "تم تسجيل الخروج بنجاح",
      loginSuccess: "مرحباً بعودتك! تم تسجيل الدخول بنجاح",
      loginFailed: "فشل تسجيل الدخول. يرجى التحقق من بياناتك",
      signupSuccess: "تم التسجيل بنجاح! يرجى تسجيل الدخول باستخدام بياناتك",
      signupFailed: "فشل التسجيل. يرجى المحاولة مرة أخرى",
      fixErrors: "يرجى إصلاح الأخطاء قبل الإرسال",
    },
  },
}

export const AccountantLanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("ar") // Default to Arabic

  useEffect(() => {
    const savedLanguage = localStorage.getItem("accountant-language")
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    } else {
      setLanguage("ar")
      localStorage.setItem("accountant-language", "ar")
    }
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en"
    setLanguage(newLanguage)
    localStorage.setItem("accountant-language", newLanguage)
  }

  return (
    <AccountantLanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        translations,
      }}
    >
      {children}
    </AccountantLanguageContext.Provider>
  )
}
