import React from "react";

const formatDate = (date, locale = "ar-EG") => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
};

const Header = ({ isRTL }) => (
  <div
    style={{
      maxWidth: 900,
      margin: "auto",
      fontFamily: "Arial, sans-serif",
      direction: isRTL ? "rtl" : "ltr",
      color: "#000",
      userSelect: "none",
      borderBottom: "3px solid #000",
      paddingBottom: 8,
      marginBottom: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <img
      src="/assets/dlogo.png" // replace with your logo path
      alt="Rukn Alwatikon Logo"
      style={{ height: 60 }}
    />
    <div style={{ textAlign: "center", flexGrow: 1 }}>
      <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
        {isRTL ? "مركز ركن الوتيقون لتأهيل ذوي الهمم" : "Rukn Alwatikon Center for Rehabilitation of People of Determination"}
      </div>
      <div style={{ fontSize: 16, fontWeight: "bold" }}>
        {isRTL ? "الخطة العلاجية الفصلية (للغة والتخاطب)" : "Quarterly Therapeutic Plan (Speech & Language)"}
      </div>
      <div style={{ marginTop: 6, fontWeight: "bold", fontSize: 14 }}>
        {isRTL ? "العام الدراسي 2025 - 2026" : "Academic Year 2025 - 2026"}
      </div>
    </div>
    <div style={{ width: 60 }} /> {/* spacer */}
  </div>
);

const Footer = ({ isRTL }) => (
  <div
    style={{
      maxWidth: 900,
      margin: "40px auto 20px auto",
      fontFamily: "Arial, sans-serif",
      direction: isRTL ? "rtl" : "ltr",
      color: "#000",
      userSelect: "none",
      borderTop: "3px solid #000",
      paddingTop: 12,
      fontSize: 14,
      display: "flex",
      justifyContent: isRTL ? "flex-start" : "flex-end",
      gap: 30,
      fontWeight: "bold",
    }}
  >
    <div>{isRTL ? "توقيع أخصائي اللغة:" : "Speech Therapist Signature:"} ___________________</div>
    <div>{isRTL ? "التاريخ:" : "Date:"} ___________________</div>
  </div>
);

const TableSection = ({ title, color, goals, isRTL }) => {
  const renderRows = () => {
  if (!goals.length) {
    return (
      <tr>
        <td colSpan={6} style={{ textAlign: "center", color: "#999", fontStyle: "italic" }}>
          {isRTL ? "لا توجد بيانات" : "No Data Available"}
        </td>
      </tr>
    );
  }
  // Sort by startDate ascending (null or invalid dates last)
  const sortedGoals = [...goals].sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return new Date(a.startDate) - new Date(b.startDate);
  });

  return sortedGoals.map((goal, idx) => (
    <tr key={goal._id || idx} style={{ backgroundColor: idx % 2 === 1 ? "#f9f1ed" : "transparent" }}>
      <td style={{ border: "1px solid #444", padding: "6px" }}>{goal.description || ""}</td>
      <td style={{ border: "1px solid #444", padding: "6px" }}>{goal.toolsUsed || ""}</td>
      <td style={{ border: "1px solid #444", padding: "6px" }}>{formatDate(goal.startDate, isRTL ? "ar-EG" : "en-US")}</td>
      <td style={{ border: "1px solid #444", padding: "6px" }}>{formatDate(goal.endDate, isRTL ? "ar-EG" : "en-US")}</td>
      <td style={{ border: "1px solid #444", padding: "6px" }}>{goal.evaluation?.status || ""}</td>
      <td style={{ border: "1px solid #444", padding: "6px" }}>{goal.evaluation?.notes || ""}</td>
    </tr>
  ));
};
;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
      <thead>
        <tr>
          <th
            colSpan={6}
            style={{
              backgroundColor: color,
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
              textAlign: isRTL ? "right" : "left",
              padding: "8px 12px",
              border: "1px solid #444",
            }}
          >
            {title}
          </th>
        </tr>
        <tr style={{ backgroundColor: "#f0c6ac" }}>
          {[
            isRTL ? "الأهداف" : "Goals",
            isRTL ? "الأدوات المستخدمة" : "Tools Used",
            isRTL ? "تاريخ بدء الهدف" : "Start Date",
            isRTL ? "تاريخ انتهاء الهدف" : "End Date",
            isRTL ? "تقييم الأهداف" : "Goals Evaluation",
            isRTL ? "ملاحظات التقييم" : "Evaluation Notes",
          ].map((header) => (
            <th
              key={header}
              style={{ border: "1px solid #444", padding: "6px", fontWeight: "bold", textAlign: "center" }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </table>
  );
};

const GoalsTableBilingual = ({
  academicYear,
  studentName,
  dateOfBirth,
  attendanceGoals = [],
  imitationGoals = [],
  receptiveLangGoals = [],
  expressiveLangGoals = [],
  language = "ar", // "ar" or "en"
}) => {
  const isRTL = language === "ar";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 900, margin: "auto", direction: isRTL ? "rtl" : "ltr" }}>
      {/* Only header at the top */}
      <Header isRTL={isRTL} />

      <div style={{ marginBottom: 20, fontSize: 16, fontWeight: "bold" }}>
        {isRTL ? (
          <>
            <div>
              <strong>اسم الطالب:</strong> {studentName || "-"}
            </div>
            <div>
              <strong>تاريخ الميلاد:</strong> {formatDate(dateOfBirth, "ar-EG") || "-"}
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>Student Name:</strong> {studentName || "-"}
            </div>
            <div>
              <strong>Date of Birth:</strong> {formatDate(dateOfBirth, "en-US") || "-"}
            </div>
          </>
        )}
      </div>

      <TableSection
        title={isRTL ? "مهارات الحضور والانتباه" : "Attendance and Attention Skills"}
        color="#f4a261"
        goals={attendanceGoals}
        isRTL={isRTL}
      />

      <TableSection
        title={isRTL ? "مهارة التقليد" : "Imitation Skill"}
        color="#e76f51"
        goals={imitationGoals}
        isRTL={isRTL}
      />

      <TableSection
        title={isRTL ? "مهارات اللغة الاستقبالية" : "Receptive Language Skills"}
        color="#2a9d8f"
        goals={receptiveLangGoals}
        isRTL={isRTL}
      />

      <TableSection
        title={isRTL ? "مهارات اللغة التعبيرية" : "Expressive Language Skills"}
        color="#f4a261"
        goals={expressiveLangGoals}
        isRTL={isRTL}
      />

      {/* Only footer at the bottom */}
      <Footer isRTL={isRTL} />
    </div>
  );
};

export default GoalsTableBilingual;
