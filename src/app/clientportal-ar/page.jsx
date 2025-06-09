// app/clientportal/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/helper/axiosSetup";
import Link from "next/link";
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiCalendarCheckLine,
  RiFileListLine,
} from "react-icons/ri";
import HeaderAr from "@/components/HeaderAr";

export default function ClientPortalPageAr() {
  // --- Auth & User State ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Modal Visibility ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- Signup Form State ---
  const [signName, setSignName] = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signPhone, setSignPhone] = useState("");
  const [signGender, setSignGender] = useState("");
  const [signPassword, setSignPassword] = useState("");
  const [signConfirm, setSignConfirm] = useState("");

  // --- Fetch current user profile if token exists ---
  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
            {},
            { withCredentials: true }
          );
          localStorage.setItem("token", r.data.accessToken);
          const retry = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`,
            { headers: { Authorization: `Bearer ${r.data.accessToken}` } }
          );
          setUser(retry.data);
        } catch {
          console.error("Failed to refresh token");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // --- Logout Handler ---
  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("token");
      setUser(null);
      setShowLoginModal(false);
      setShowSignupModal(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // --- Card click guard ---
  const handleCardClick = (href) => (e) => {
    if (!user || user.role !== "patient") {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  // --- Login submit ---
  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/signin/patient`,
        { email: loginEmail, password: loginPassword }
      );
      localStorage.setItem("token", res.data.accessToken);
      setShowLoginModal(false);
      await loadProfile();
    } catch (err) {
      alert(err.response?.data?.message || "فشل تسجيل الدخول");
    }
  };

  // --- Signup submit ---
  const onSignup = async (e) => {
    e.preventDefault();
    if (signPassword !== signConfirm) {
      alert("كلمتا المرور غير متطابقتين");
      return;
    }
    try {
      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/patient`,
        {
          name: signName,
          email: signEmail,
          phone: signPhone,
          gender: signGender,
          password: signPassword,
        }
      );
      alert("تم التسجيل بنجاح، الرجاء تسجيل الدخول");
      setShowSignupModal(false);
      setShowLoginModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "فشل التسجيل");
    }
  };

  // --- Static content ---
  const disclaimerLines = [
    "يرجى ملاحظة أن هذه ليست خدمة طوارئ.",
    "في حالة الطوارئ، اتصل بالرقم 999 (شرطة)، 998 (إسعاف)، أو توجه إلى أقرب قسم طوارئ.",
    "إذا لم تتمكن من الحضور أو رغبت في إعادة الجدولة، يرجى الإبلاغ قبل 24 ساعة على الأقل؛ وإلا قد يتم تطبيق رسوم إلغاء.",
    "جميع المراسلات سرية. يرجى عدم الكشف عن موعدك أو معلوماتك الشخصية خارج هذا المكتب.",
    "للمواعيد الحضورية، يرجى الحضور قبل 15 دقيقة لإكمال الأوراق اللازمة.",
    "إذا كان لديك تأمين، يرجى إحضار تفاصيل وثيقتك (اسم الجهة المؤمنة، رقم الوثيقة، رقم المشترك).",
    "للطب عن بُعد، تأكد من أن لديك اتصال إنترنت مستقر، جهاز متوافق، ومكان هادئ خاص.",
  ];

  const cards = [
    { href: "/wizard", Icon: RiCalendarEventLine, label: "حجز موعد" },
    { href: "/profile", Icon: RiGroupLine, label: "الملف الشخصي" },
    { href: "/calendar-main-patient", Icon: RiCalendarCheckLine, label: "مواعيدي" },
    { href: "/my-invoices", Icon: RiFileListLine, label: "فواتيري" },
  ];


  return (
    <>
      <div dir="rtl" className="d-flex flex-column min-vh-100 bg-white">
        <HeaderAr
          user={user}
          loading={loading}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
        />

        <main className="container my-5 flex-grow-1">
          {/* Disclaimer */}
          <div className="card mb-4">
            <div className="card-body text-end">
              {disclaimerLines.map((line, i) => (
                <p key={i} className={i === 0 ? "fw-bold mb-3" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Buttons grid */}
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {cards.map(({ href, Icon, label }, idx) => (
              <div key={idx} className="col">
                <Link
                  href={href}
                  className="btn btn-outline-primary border-2 shadow-sm w-100 h-100 d-flex flex-column justify-content-center align-items-center py-5"
                >
                  <Icon className="fs-1 mb-3" />
                  <span className="h5 mb-0">{label}</span>
                </Link>
              </div>
            ))}
          </div>
        </main>

        {/* Login Modal */}
        <div className={`modal fade ${showLoginModal ? "show d-block" : ""}`} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تسجيل الدخول</h5>
                <button type="button" className="btn-close" onClick={() => setShowLoginModal(false)} />
              </div>
              <div className="modal-body text-end"><form onSubmit={onLogin}>
              <div className="mb-3"><label className="form-label">البريد الإلكتروني</label><input type="email" className="form-control" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required/></div>
              <div className="mb-3"><label className="form-label">كلمة المرور</label><input type="password" className="form-control" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required/></div>
              <button type="submit" className="btn btn-primary w-100 mb-2">تسجيل الدخول</button>
            </form>
            <div className="text-center"><button className="btn btn-link" onClick={()=>{setShowLoginModal(false);setShowSignupModal(true);}}>مستخدم جديد؟ سجل هنا</button></div></div>
          </div></div>
        </div>

        <div className={`modal fade ${showSignupModal?"show d-block":""}`} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
            <div className="modal-header text-end"><h5 className="modal-title">تسجيل جديد</h5><button type="button" className="btn-close" onClick={()=>setShowSignupModal(false)}/></div>
            <div className="modal-body text-end"><form onSubmit={onSignup}>
              <div className="mb-3"><label className="form-label">الاسم</label><input type="text" className="form-control" value={signName} onChange={e=>setSignName(e.target.value)} required/></div>
              <div className="mb-3"><label className="form-label">البريد الإلكتروني</label><input type="email" className="form-control" value={signEmail} onChange={e=>setSignEmail(e.target.value)} required/></div>
              <div className="mb-3"><label className="form-label">الهاتف</label><input type="tel" className="form-control" value={signPhone} onChange={e=>setSignPhone(e.target.value)} required/></div>
              <div className="mb-3"><label className="form-label">الجنس</label><select className="form-select" value={signGender} onChange={e=>setSignGender(e.target.value)} required><option value=""></option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
              <div className="mb-3"><label className="form-label">كلمة المرور</label><input type="password" className="form-control" value={signPassword} onChange={e=>setSignPassword(e.target.value)} required/></div>
              <div className="mb-3"><label className="form-label">تأكيد كلمة المرور</label><input type="password" className="form-control" value={signConfirm} onChange={e=>setSignConfirm(e.target.value)} required/></div>
              <button type="submit" className="btn btn-primary w-100">تسجيل</button>
            </form></div>
          </div></div>
        </div>

        {/* Backdrop */}
        {(showLoginModal || showSignupModal) && (
          <div className="modal-backdrop fade show" onClick={() => {
            setShowLoginModal(false);
            setShowSignupModal(false);
          }} />
        )}
      </div>
    </>
  );
}
