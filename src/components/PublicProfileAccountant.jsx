"use client"
import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  FileText,
  Building2,
  Clock,
  DollarSign,
} from "lucide-react"

import axiosInstance from "@/helper/axiosSetup"
import styles from "../styles/profile-view.module.css"
import { useAccountantLanguage } from "../contexts/accountant-language-context"

const PublicProfileAccountant = () => {
  const { language, translations } = useAccountantLanguage()
  const isRTL = language === "ar"

  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Get current user
  const getCurrentUser = () => {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  }

  const user = getCurrentUser()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    department: "",
    experience: "",
    employeeId: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Translations
  const t = {
    profile: {
      title: language === "ar" ? "الملف الشخصي للمحاسب" : "Accountant Profile",
      subtitle:
        language === "ar" ? "إدارة معلومات ملفك الشخصي والإعدادات" : "Manage your profile information and settings",
      loading: language === "ar" ? "جاري تحميل ملفك الشخصي..." : "Loading your profile...",
      notFound: language === "ar" ? "الملف الشخصي غير موجود" : "Profile not found",
      quickInfo: language === "ar" ? "معلومات سريعة" : "Quick Info",
      accountant: language === "ar" ? "محاسب" : "Accountant",
      notProvided: language === "ar" ? "غير محدد" : "Not provided",
      notAssigned: language === "ar" ? "غير مخصص" : "Not assigned",
    },
    fields: {
      fullName: language === "ar" ? "الاسم الكامل" : "Full Name",
      email: language === "ar" ? "عنوان البريد الإلكتروني" : "Email Address",
      phone: language === "ar" ? "رقم الهاتف" : "Phone Number",
      address: language === "ar" ? "العنوان" : "Address",
      dateOfBirth: language === "ar" ? "تاريخ الميلاد" : "Date of Birth",
      department: language === "ar" ? "القسم" : "Department",
      experience: language === "ar" ? "الخبرة" : "Experience",
      employeeId: language === "ar" ? "رقم الموظف" : "Employee ID",
      currentPassword: language === "ar" ? "كلمة المرور الحالية" : "Current Password",
      newPassword: language === "ar" ? "كلمة المرور الجديدة" : "New Password",
      confirmPassword: language === "ar" ? "تأكيد كلمة المرور" : "Confirm New Password",
    },
    tabs: {
      editProfile: language === "ar" ? "تعديل الملف الشخصي" : "Edit Profile",
      changePassword: language === "ar" ? "تغيير كلمة المرور" : "Change Password",
      financialReports: language === "ar" ? "التقارير المالية" : "Financial Reports",
    },
    buttons: {
      edit: language === "ar" ? "تعديل الملف الشخصي" : "Edit Profile",
      save: language === "ar" ? "حفظ التغييرات" : "Save Changes",
      saving: language === "ar" ? "جاري الحفظ..." : "Saving...",
      cancel: language === "ar" ? "إلغاء" : "Cancel",
      changePassword: language === "ar" ? "تغيير كلمة المرور" : "Change Password",
      changing: language === "ar" ? "جاري التغيير..." : "Changing...",
    },
    messages: {
      profileUpdated: language === "ar" ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!",
      profileUpdateFailed:
        language === "ar"
          ? "فشل في تحديث الملف الشخصي. يرجى المحاولة مرة أخرى."
          : "Failed to update profile. Please try again.",
      passwordChanged: language === "ar" ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!",
      passwordChangeFailed:
        language === "ar"
          ? "فشل في تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية."
          : "Failed to change password. Please check your current password.",
      passwordMismatch: language === "ar" ? "كلمات المرور الجديدة غير متطابقة!" : "New passwords don't match!",
      passwordTooShort:
        language === "ar"
          ? "يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل!"
          : "New password must be at least 6 characters long!",
    },
    placeholders: {
      experience: language === "ar" ? "مثال: 5 سنوات" : "e.g., 5 years",
    },
  }

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/authentication/accountant/${user?.id}`)
      const profileData = response.data
      setProfile(profileData)
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split("T")[0] : "",
        department: profileData.department || "",
        experience: profileData.experience || "",
        employeeId: profileData.employeeId || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      await axiosInstance.put(`/authentication/accountant/${user?.id}`, formData)
      await fetchProfile()
      setEditing(false)
      alert(t.messages.profileUpdated)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(t.messages.profileUpdateFailed)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t.messages.passwordMismatch)
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert(t.messages.passwordTooShort)
      return
    }

    try {
      setSaving(true)
      await axiosInstance.put(`/authentication/change-password/${user?.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      alert(t.messages.passwordChanged)
    } catch (error) {
      console.error("Error changing password:", error)
      alert(t.messages.passwordChangeFailed)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return t.profile.notProvided
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name) => {
    if (!name || typeof name !== "string") {
      return language === "ar" ? "محا" : "ACC"
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className={`${styles.container} ${isRTL ? styles.rtl : styles.ltr}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>{t.profile.loading}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`${styles.container} ${isRTL ? styles.rtl : styles.ltr}`}>
        <div className={styles.loadingContainer}>
          <p>{t.profile.notFound}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : styles.ltr}`}>
      <div className={styles.profileWrapper}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}></div>
          <div className={styles.profileContent}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>{getInitials(profile?.name || t.profile.accountant)}</div>
              <h2 className={styles.profileName}>{profile?.name || translations.common.loading}</h2>
              <p className={styles.profileEmail}>{profile?.email || translations.common.loading}</p>
              <div className={styles.profileBadge}>
                <DollarSign className={styles.profileBadgeIcon} />
                {t.profile.accountant}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.infoTitle}>
                <User className={styles.infoTitleIcon} />
                {t.profile.quickInfo}
              </h3>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Phone className={styles.infoLabelIcon} />
                    {t.fields.phone}
                  </span>
                  <span className={`${styles.infoValue} ${!profile.phone ? styles.notProvided : ""}`}>
                    {profile.phone || t.profile.notProvided}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <MapPin className={styles.infoLabelIcon} />
                    {t.fields.address}
                  </span>
                  <span className={`${styles.infoValue} ${!profile.address ? styles.notProvided : ""}`}>
                    {profile.address || t.profile.notProvided}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Building2 className={styles.infoLabelIcon} />
                    {t.fields.department}
                  </span>
                  <span className={`${styles.infoValue} ${!profile.department ? styles.notProvided : ""}`}>
                    {profile.department || t.profile.notAssigned}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Calendar className={styles.infoLabelIcon} />
                    {t.fields.experience}
                  </span>
                  <span className={`${styles.infoValue} ${!profile.experience ? styles.notProvided : ""}`}>
                    {profile.experience || t.profile.notProvided}
                  </span>
                </li>
                <li className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Shield className={styles.infoLabelIcon} />
                    {t.fields.employeeId}
                  </span>
                  <span className={`${styles.infoValue} ${!profile.employeeId ? styles.notProvided : ""}`}>
                    {profile.employeeId || t.profile.notProvided}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>{t.profile.title}</h1>
            <p className={styles.contentSubtitle}>{t.profile.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <ul className={styles.tabsList}>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "profile" ? styles.active : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <Edit3 className={styles.tabIcon} />
                  {t.tabs.editProfile}
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "password" ? styles.active : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <Lock className={styles.tabIcon} />
                  {t.tabs.changePassword}
                </button>
              </li>
              <li className={styles.tabItem}>
                <button
                  className={`${styles.tabButton} ${activeTab === "reports" ? styles.active : ""}`}
                  onClick={() => setActiveTab("reports")}
                >
                  <FileText className={styles.tabIcon} />
                  {t.tabs.financialReports}
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Profile Tab */}
            <div className={`${styles.tabPane} ${activeTab === "profile" ? styles.active : ""}`}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <User className={styles.labelIcon} />
                      {t.fields.fullName} <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Mail className={styles.labelIcon} />
                      {t.fields.email} <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Phone className={styles.labelIcon} />
                      {t.fields.phone}
                    </label>
                    <input
                      type="tel"
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Calendar className={styles.labelIcon} />
                      {t.fields.dateOfBirth}
                    </label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Building2 className={styles.labelIcon} />
                      {t.fields.department}
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Clock className={styles.labelIcon} />
                      {t.fields.experience}
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      disabled={!editing}
                      placeholder={t.placeholders.experience}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      <Shield className={styles.labelIcon} />
                      {t.fields.employeeId}
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange("employeeId", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className={styles.formGroup}></div>
                </div>

                <div className={styles.formGroup + " " + styles.fullWidth}>
                  <label className={styles.formLabel}>
                    <MapPin className={styles.labelIcon} />
                    {t.fields.address}
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!editing}
                    rows={3}
                  />
                </div>

                <div className={styles.formActions}>
                  {editing ? (
                    <>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditing(false)
                          fetchProfile()
                        }}
                        disabled={saving}
                      >
                        <X className={styles.buttonIcon} />
                        {t.buttons.cancel}
                      </button>
                      <button type="button" className={styles.saveButton} onClick={handleSaveProfile} disabled={saving}>
                        <Save className={styles.buttonIcon} />
                        {saving ? t.buttons.saving : t.buttons.save}
                      </button>
                    </>
                  ) : (
                    <button type="button" className={styles.saveButton} onClick={() => setEditing(true)}>
                      <Edit3 className={styles.buttonIcon} />
                      {t.buttons.edit}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Password Tab */}
            <div className={`${styles.tabPane} ${activeTab === "password" ? styles.active : ""}`}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    {t.fields.currentPassword} <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    {t.fields.newPassword} <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Lock className={styles.labelIcon} />
                    {t.fields.confirmPassword} <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={styles.formInput}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className={styles.passwordToggleIcon} />
                      ) : (
                        <Eye className={styles.passwordToggleIcon} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleChangePassword}
                    disabled={
                      saving ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                  >
                    <Lock className={styles.buttonIcon} />
                    {saving ? t.buttons.changing : t.buttons.changePassword}
                  </button>
                </div>
              </form>
            </div>

            {/* Financial Reports Tab */}
            <div className={`${styles.tabPane} ${activeTab === "reports" ? styles.active : ""}`}>
              <div className={styles.reportsContainer}>
                <div className={styles.reportsHeader}>
                  <h3 className={styles.reportsTitle}>
                    <FileText className={styles.reportsTitleIcon} />
                    {t.tabs.financialReports}
                  </h3>
                  <p className={styles.reportsSubtitle}>
                    {language === "ar"
                      ? "عرض وإدارة التقارير المالية والإحصائيات"
                      : "View and manage financial reports and statistics"}
                  </p>
                </div>
                <div className={styles.reportsGrid}>
                  <div className={styles.reportCard}>
                    <div className={styles.reportCardIcon}>
                      <DollarSign />
                    </div>
                    <h4 className={styles.reportCardTitle}>
                      {language === "ar" ? "تقرير المدفوعات الشهرية" : "Monthly Payments Report"}
                    </h4>
                    <p className={styles.reportCardDescription}>
                      {language === "ar"
                        ? "عرض تفصيلي للمدفوعات والإيرادات الشهرية"
                        : "Detailed view of monthly payments and revenue"}
                    </p>
                  </div>
                  <div className={styles.reportCard}>
                    <div className={styles.reportCardIcon}>
                      <FileText />
                    </div>
                    <h4 className={styles.reportCardTitle}>{language === "ar" ? "تقرير الشيكات" : "Checks Report"}</h4>
                    <p className={styles.reportCardDescription}>
                      {language === "ar" ? "متابعة حالة الشيكات والمقاصة" : "Track check status and clearances"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfileAccountant
