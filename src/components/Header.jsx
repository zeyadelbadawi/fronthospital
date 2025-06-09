// components/Header.jsx
"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import React from "react";

export default function Header({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/assets/logo.png",
  title = "Rukn Elwatikon Center Client Portal",
}) {
  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-primary">
<Link href="/clientportal" passHref>
      <img
        src={logoSrc}
        style={{ height: 130, cursor: 'pointer' }}
        alt="Logo"
      />
    </Link>      <h1 className="flex-grow-1 text-center h4 mb-0">{title}</h1>

      {!loading && user && user.role === "patient" ? (
        <div className="dropdown">
          <button
            className="btn btn-outline-primary border-2 rounded-pill px-4 dropdown-toggle"
            type="button"
            id="patientMenuBtn"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {user.name}
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end mt-2"
            aria-labelledby="patientMenuBtn"
          >
            <li>
              <Link href="/calendar-main-patient" className="dropdown-item">
                My Appointments
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
                Log out
              </button>
            </li>
          </ul>
          
        </div>
        
      ) : (
        <button
          className="btn btn-outline-primary"
          onClick={onLoginClick}
        >
          Login
        </button>
      )}
    </header>
  );
}
