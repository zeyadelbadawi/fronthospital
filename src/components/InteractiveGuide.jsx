"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import styles from "../styles/InteractiveGuide.module.css"
import {
  ClipboardList,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Globe,
  Lightbulb,
  Target,
} from "lucide-react"

const InteractiveGuide = ({ isActive, currentStep, onStepChange, onClose }) => {
  const { language, toggleLanguage } = useLanguage()
  const [guideStep, setGuideStep] = useState(0)
  const [spotlightElement, setSpotlightElement] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const overlayRef = useRef(null)

  // Enhanced guide steps with more detailed Arabic content
  const getGuideSteps = useCallback(
    () => [
      {
        step: 0,
        title: language === "ar" ? "اختيار نوع التقييم" : "Select Evaluation Type",
        description:
          language === "ar"
            ? "مرحباً بك في مركز ركن الواتيكون! هذه هي الخطوة الأولى والأهم في رحلة حجز موعدك. اختر نوع التقييم المناسب لاحتياجاتك من القائمة المنسدلة. كل نوع له مميزات وأسعار مختلفة، لذا اقرأ الخيارات بعناية."
            : "Welcome to Rukn Elwatikon Center! This is the first and most important step in your appointment booking journey. Choose the evaluation type that suits your needs from the dropdown menu. Each type has different features and pricing, so read the options carefully.",
        highlights: [
          language === "ar"
            ? "انقر على القائمة المنسدلة المسلط عليها أدناه"
            : "Click on the highlighted dropdown menu below",
          language === "ar" ? "اقرأ وصف كل نوع تقييم بعناية" : "Read each evaluation type's description carefully",
          language === "ar"
            ? "اختر النوع الأنسب لحالتك الصحية"
            : "Choose the most suitable type for your health condition",
          language === "ar"
            ? "انقر زر 'متابعة' للانتقال للخطوة التالية"
            : "Click 'Continue' button to proceed to next step",
        ],
        targetSelector: ".ruknSelectWrapper",
        cardPosition: "bottomRight",
        icon: <ClipboardList size={24} />,
        tips:
          language === "ar"
            ? "💡 نصيحة: التقييم المدرسي مناسب للأطفال في سن المدرسة، بينما الحزمة الكاملة شاملة لجميع الأعمار"
            : "💡 Tip: School evaluation is suitable for school-age children, while full package is comprehensive for all ages",
      },
      {
        step: 1,
        title: language === "ar" ? "جدولة الموعد" : "Schedule Your Appointment",
        description:
          language === "ar"
            ? "الآن حان وقت اختيار موعدك المثالي! أولاً، حدد التاريخ المناسب من التقويم (نحن متاحون أيام الجمعة والأحد فقط). ثم اختر الوقت المناسب لك من الأوقات المتاحة. أخيراً، اكتب وصفاً واضحاً ومفصلاً عن احتياجاتك ليتمكن فريقنا من تقديم أفضل خدمة لك."
            : "Now it's time to choose your perfect appointment! First, select a suitable date from the calendar (we're available on Fridays and Sundays only). Then pick a convenient time from available slots. Finally, write a clear and detailed description of your needs so our team can provide the best service for you.",
        highlights: [
          language === "ar"
            ? "اختر التاريخ من التقويم (الجمعة والأحد فقط)"
            : "Pick a date from calendar (Fridays and Sundays only)",
          language === "ar" ? "حدد الوقت المناسب من الشبكة الزمنية" : "Select convenient time from the time grid",
          language === "ar"
            ? "اكتب وصفاً مفصلاً وواضحاً لاحتياجاتك"
            : "Write detailed and clear description of your needs",
          language === "ar" ? "تأكد من ملء جميع الحقول المطلوبة (*)" : "Make sure to fill all required fields (*)",
        ],
        targetSelector: ".ruknFormGrid",
        cardPosition: "topRight",
        icon: <Calendar size={24} />,
        tips:
          language === "ar"
            ? "💡 نصيحة: الأوقات المتاحة من 12:00 ظهراً إلى 8:00 مساءً، والمواعيد الخضراء متاحة والحمراء محجوزة"
            : "💡 Tip: Available times are from 12:00 PM to 8:00 PM, green slots are available and red ones are booked",
      },
      {
        step: 2,
        title: language === "ar" ? "مراجعة وتحرير المستند" : "Review & Edit Document",
        description:
          language === "ar"
            ? "هذه خطوة بالغة الأهمية! ستجد أدناه محرر المستندات المتطور حيث يمكنك مراجعة وتعديل مستند خطة العلاج الخاص بك. هذا المستند سيكون دليلك العلاجي، لذا تأكد من مراجعته بعناية وإجراء أي تعديلات ضرورية. لا تنس حفظ التغييرات!"
            : "This is an extremely important step! Below you'll find the advanced document editor where you can review and edit your treatment plan document. This document will be your therapeutic guide, so make sure to review it carefully and make any necessary modifications. Don't forget to save your changes!",
        highlights: [
          language === "ar"
            ? "استخدم محرر المستندات المتطور المسلط عليه"
            : "Use the highlighted advanced document editor",
          language === "ar"
            ? "راجع محتوى خطة العلاج بدقة وعناية"
            : "Review treatment plan content carefully and precisely",
          language === "ar" ? "عدّل أي معلومات تراها غير مناسبة" : "Edit any information you find inappropriate",
          language === "ar" ? "احفظ جميع التغييرات قبل المتابعة" : "Save all changes before proceeding",
        ],
        targetSelector: ".ruknDocumentContainer",
        cardPosition: "topLeft",
        icon: <FileText size={24} />,
        tips:
          language === "ar"
            ? "💡 نصيحة: يمكنك استخدام أزرار التحرير في الأعلى للتنسيق، وتأكد من النقر على 'حفظ' عند الانتهاء"
            : "💡 Tip: You can use the editing buttons at the top for formatting, and make sure to click 'Save' when finished",
      },
      {
        step: 3,
        title: language === "ar" ? "إتمام عملية الدفع" : "Complete Payment Process",
        description:
          language === "ar"
            ? "الخطوة الأخيرة في رحلتك! راجع ملخص التكاليف المعروض بعناية فائقة وتأكد من صحة جميع البيانات والمبالغ. نظام الدفع لدينا آمن ومشفر بالكامل. بمجرد النقر على زر الدفع، ستتم معالجة طلبك فوراً وستحصل على تأكيد الحجز."
            : "The final step in your journey! Carefully review the displayed cost summary and ensure all data and amounts are correct. Our payment system is secure and fully encrypted. Once you click the payment button, your request will be processed immediately and you'll receive booking confirmation.",
        highlights: [
          language === "ar" ? "راجع ملخص التكاليف والمبالغ بدقة" : "Review cost summary and amounts precisely",
          language === "ar" ? "تأكد من صحة جميع البيانات المعروضة" : "Verify all displayed data is correct",
          language === "ar" ? "انقر زر الدفع الآمن والمشفر" : "Click the secure and encrypted payment button",
          language === "ar" ? "انتظر رسالة تأكيد إتمام العملية" : "Wait for operation completion confirmation message",
        ],
        targetSelector: ".ruknPaymentSummary",
        cardPosition: "topLeft",
        icon: <CreditCard size={24} />,
        tips:
          language === "ar"
            ? "💡 نصيحة: جميع المدفوعات آمنة ومشفرة بتقنية SSL، وستتلقى فاتورة إلكترونية فور إتمام الدفع"
            : "💡 Tip: All payments are secure and SSL encrypted, and you'll receive an electronic invoice upon payment completion",
      },
      {
        step: 4,
        title: language === "ar" ? "تم الحجز بنجاح!" : "Booking Completed Successfully!",
        description:
          language === "ar"
            ? "ألف مبروك! 🎉 تم حجز موعدك بنجاح في مركز ركن الواتيكون للتأهيل. ستجد هنا جميع التفاصيل المهمة والخطوات التالية التي يجب اتباعها. كما ستتلقى رسالة تأكيد مفصلة عبر البريد الإلكتروني خلال دقائق قليلة."
            : "Congratulations! 🎉 Your appointment has been successfully booked at Rukn Elwatikon Rehabilitation Center. Here you'll find all important details and next steps to follow. You'll also receive a detailed confirmation email within a few minutes.",
        highlights: [
          language === "ar" ? "اقرأ رسالة التأكيد والتفاصيل بعناية" : "Read confirmation message and details carefully",
          language === "ar" ? "راجع الخطوات التالية المطلوبة منك" : "Review the next steps required from you",
          language === "ar" ? "احتفظ بجميع تفاصيل الموعد في مكان آمن" : "Keep all appointment details in a safe place",
          language === "ar" ? "انتظر رسالة التأكيد عبر البريد الإلكتروني" : "Wait for confirmation email message",
        ],
        targetSelector: ".ruknSuccessContainer",
        cardPosition: "center",
        icon: <CheckCircle size={24} />,
        tips:
          language === "ar"
            ? "💡 نصيحة: احرص على الوصول قبل 15 دقيقة من موعدك، وأحضر معك بطاقة الهوية وأي تقارير طبية سابقة"
            : "💡 Tip: Make sure to arrive 15 minutes before your appointment, and bring your ID card and any previous medical reports",
      },
    ],
    [language],
  )

  const guideSteps = getGuideSteps()
  const currentGuideStep = guideSteps[guideStep]

  // Enhanced spotlight highlighting with better animations
  const highlightCurrentTab = useCallback(() => {
    // Remove previous highlighting
    document.querySelectorAll(".highlightedTab").forEach((el) => {
      el.classList.remove("highlightedTab")
    })

    // Highlight current tab with enhanced effects
    const currentTabSelector = currentGuideStep?.targetSelector
    if (currentTabSelector) {
      const targetElement = document.querySelector(currentTabSelector)
      if (targetElement) {
        const tabContainer =
          targetElement.closest(".ruknStepContent") || targetElement.closest(".ruknMainCard") || targetElement
        if (tabContainer) {
          tabContainer.classList.add("highlightedTab")

          // Add pulsing effect for better visibility
          tabContainer.style.animation = "highlightPulse 2s infinite"
        }
      }
    }
  }, [currentGuideStep])

  // Enhanced transition effects
  const playTransitionEffect = useCallback(() => {
    setIsTransitioning(true)

    // Visual transition effect
    const spotlight = overlayRef.current?.querySelector('[class*="spotlight"]')
    if (spotlight) {
      spotlight.style.transform = "scale(1.1)"
      spotlight.style.filter = "brightness(1.3)"

      setTimeout(() => {
        spotlight.style.transform = "scale(1)"
        spotlight.style.filter = "brightness(1)"
      }, 300)
    }

    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }, [])

  // Update spotlight when guide step changes
  useEffect(() => {
    if (!isActive || !currentGuideStep) return

    const updateSpotlight = () => {
      const targetElement = document.querySelector(currentGuideStep.targetSelector)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        const padding = 25 // Increased padding for better visibility

        setSpotlightElement({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        })

        // Smooth scroll to target element
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        })
      }
    }

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(updateSpotlight, 100)

    // Update on window resize
    window.addEventListener("resize", updateSpotlight)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updateSpotlight)
    }
  }, [isActive, currentGuideStep])

  // Enhanced highlighting effect
  useEffect(() => {
    if (isActive) {
      highlightCurrentTab()
    }
    return () => {
      document.querySelectorAll(".highlightedTab").forEach((el) => {
        el.classList.remove("highlightedTab")
        el.style.animation = ""
      })
    }
  }, [isActive, highlightCurrentTab])

  // Sync guide step with current step
  useEffect(() => {
    if (isActive && currentStep !== guideStep) {
      setGuideStep(currentStep)
    }
  }, [currentStep, isActive, guideStep])

  // Enhanced navigation handlers
  const handleNext = () => {
    if (guideStep < guideSteps.length - 1 && !isTransitioning) {
      playTransitionEffect()
      const nextStep = guideStep + 1
      setGuideStep(nextStep)
      onStepChange(nextStep)
    }
  }

  const handlePrev = () => {
    if (guideStep > 0 && !isTransitioning) {
      playTransitionEffect()
      const prevStep = guideStep - 1
      setGuideStep(prevStep)
      onStepChange(prevStep)
    }
  }

  const handleFinish = () => {
    // Clean up highlighting
    document.querySelectorAll(".highlightedTab").forEach((el) => {
      el.classList.remove("highlightedTab")
      el.style.animation = ""
    })

    // Return to first tab
    onStepChange(0)

    // Close guide
    onClose()
  }

  // Enhanced language toggle handler
  const handleLanguageToggle = () => {
    playTransitionEffect()
    toggleLanguage()
  }

  if (!isActive || !currentGuideStep) return null

  return (
    <div className={`${styles.overlay} ${language === "ar" ? styles.rtl : styles.ltr}`} ref={overlayRef}>
      {/* Enhanced Spotlight */}
      {spotlightElement && (
        <div
          className={styles.spotlight}
          style={{
            top: `${spotlightElement.top}px`,
            left: `${spotlightElement.left}px`,
            width: `${spotlightElement.width}px`,
            height: `${spotlightElement.height}px`,
          }}
        />
      )}

      {/* Enhanced Guide Card */}
      <div
        className={`${styles.guideCard} ${styles[currentGuideStep.cardPosition]} ${language === "ar" ? styles.rtl : ""} ${isTransitioning ? styles.transitioning : ""}`}
      >
        {/* Enhanced Header with Language Toggle */}
        <div className={styles.guideHeader}>
          <div className={styles.stepIcon}>{currentGuideStep.icon}</div>
          <div className={styles.stepInfo}>
            <h3>{currentGuideStep.title}</h3>
            <p className={styles.stepCounter}>
              {language === "ar"
                ? `الخطوة ${guideStep + 1} من ${guideSteps.length}`
                : `Step ${guideStep + 1} of ${guideSteps.length}`}
            </p>
          </div>
          {/* Language Toggle Button */}
          <button
            className={styles.languageToggle}
            onClick={handleLanguageToggle}
            title={language === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            <Globe size={18} />
            <span>{language === "ar" ? "EN" : "عر"}</span>
          </button>
        </div>

        {/* Enhanced Content */}
        <div className={styles.guideContent}>
          <p className={styles.description}>{currentGuideStep.description}</p>

          <div className={styles.highlightSection}>
            <h4 className={styles.highlightTitle}>
              <Target size={16} />
              {language === "ar" ? "خطوات العمل:" : "Action Steps:"}
            </h4>
            <ul className={styles.highlightList}>
              {currentGuideStep.highlights.map((highlight, index) => (
                <li key={index}>
                  <Check size={16} />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips Section */}
          {currentGuideStep.tips && (
            <div className={styles.tipsSection}>
              <div className={styles.tipContent}>
                <Lightbulb size={16} />
                <span>{currentGuideStep.tips}</span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Actions */}
        <div className={styles.guideActions}>
          <button className={styles.skipButton} onClick={onClose}>
            <X size={16} />
            {language === "ar" ? "تخطي الدليل" : "Skip Guide"}
          </button>

          <div className={styles.navigationButtons}>
            {guideStep > 0 && (
              <button className={styles.prevButton} onClick={handlePrev} disabled={isTransitioning}>
                <ArrowLeft size={16} />
                {language === "ar" ? "السابق" : "Previous"}
              </button>
            )}

            {guideStep < guideSteps.length - 1 ? (
              <button className={styles.nextButton} onClick={handleNext} disabled={isTransitioning}>
                {language === "ar" ? "التالي" : "Next"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className={styles.finishButton} onClick={handleFinish} disabled={isTransitioning}>
                {language === "ar" ? "إنهاء الدليل" : "Finish Guide"}
                <CheckCircle size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className={styles.progressIndicator}>
          <div className={styles.progressBar} style={{ width: `${((guideStep + 1) / guideSteps.length) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

export default InteractiveGuide
