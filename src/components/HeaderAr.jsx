// components/HeaderAr.jsx
"use client";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";

export default function HeaderAr({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/assets/logo.png",
  title = "بوابة عملاء مركز رُكن الواثقون",
}) {
  return (
    <header
      dir="rtl"
      className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-primary"
    >
<Link href="/clientportal-ar" passHref>
      <img
        src={logoSrc}
        style={{ height: 130, cursor: 'pointer' }}
        alt="شعار"
      />
    </Link>      <h1 className="flex-grow-1 text-center h4 mb-0">{title}</h1>

      {!loading && user && user.role === "patient" ? (
        <div className="dropdown">
          <button
            className="btn btn-outline-primary border-2 rounded-pill px-4 dropdown-toggle"
            type="button"
            id="patientMenuBtnAr"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {user.name}
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end mt-2 text-end"
            aria-labelledby="patientMenuBtnAr"
          >
            <li>
              <Link href="/my-appointments" className="dropdown-item">
                مواعيدي
              </Link>
            </li>
            <li>
              <Link href="/profile" className="dropdown-item">
                الملف الشخصي
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={onLogout}
              >
                تسجيل الخروج
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <button className="btn btn-outline-primary" onClick={onLoginClick}>
          تسجيل الدخول
        </button>
      )}
    </header>
  );
}
