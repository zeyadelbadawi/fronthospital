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
import Header from "@/components/Header";

export default function ClientPortalPage() {
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
            {
              headers: { Authorization: `Bearer ${r.data.accessToken}` },
            }
          );
          setUser(retry.data);
        } catch {}
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
      await axiosInstance.post("/authentication/logout", {}, { withCredentials: true });
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
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // --- Signup submit ---
  const onSignup = async (e) => {
    e.preventDefault();
    if (signPassword !== signConfirm) {
      alert("Passwords don’t match");
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
      alert("Registration successful—please log in");
      setShowSignupModal(false);
      setShowLoginModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  // --- Static content ---
  const disclaimerLines = [
    "PLEASE NOTE THAT THIS IS NOT AN EMERGENCY SERVICE.",
    "In case of an emergency, call 999 (police), 998 (ambulance), or go to the nearest A&E facility.",
    "If you are unable to attend or wish to reschedule, please provide at least 24 hours’ notice; otherwise a cancellation fee may apply.",
    "All correspondence is confidential. Please do not disclose your appointment or personal information outside this office.",
    "For in-person appointments, arrive 15 minutes early to complete any necessary paperwork.",
    "If you have insurance, bring your policy details (insurer name, policy number, subscriber ID).",
    "For telemedicine, ensure you have a stable internet connection, a compatible device, and a quiet private space.",
  ];

  const cards = [
    { href: "/wizard", Icon: RiCalendarEventLine, label: "Book Appointment" },
    { href: "/profile", Icon: RiGroupLine, label: "My Profile" },
    {
      href: "/calendar-main-patient",
      Icon: RiCalendarCheckLine,
      label: "My Appointments",
    },
    { href: "/my-invoices", Icon: RiFileListLine, label: "My Invoices" },
  ];

  return (
    <>
      <div className="d-flex flex-column min-vh-100 bg-white">
        <Header
          user={user}
          loading={loading}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
        />

        <main className="container my-5 flex-grow-1">
          {/* Disclaimer */}
          <div className="card mb-4">
            <div className="card-body">
              {disclaimerLines.map((line, i) => (
                <p key={i} className={i === 0 ? "fw-bold text-uppercase mb-3" : ""}>
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
                  className="btn btn-outline-primary shadow-sm w-100 h-100 d-flex flex-column justify-content-center align-items-center py-5"
                  onClick={handleCardClick(href)}
                >
                  <Icon className="fs-1 mb-3" />
                  <span className="h5 mb-0">{label}</span>
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <div className={`modal fade ${showLoginModal ? "show d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Login</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowLoginModal(false)}
              />
            </div>
            <div className="modal-body">
              <form onSubmit={onLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-check mb-3">
                  <input id="remember" type="checkbox" className="form-check-input" />
                  <label htmlFor="remember" className="form-check-label">
                    Remember me
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-2">
                  Login
                </button>
              </form>
              <div className="text-center">
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }}
                >
                  First time? Register here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <div className={`modal fade ${showSignupModal ? "show d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Register</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowSignupModal(false)}
              />
            </div>
            <div className="modal-body">
              <form onSubmit={onSignup}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={signPhone}
                    onChange={(e) => setSignPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={signGender}
                    onChange={(e) => setSignGender(e.target.value)}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={signPassword}
                    onChange={(e) => setSignPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={signConfirm}
                    onChange={(e) => setSignConfirm(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {(showLoginModal || showSignupModal) && (
        <div
          className="modal-backdrop fade show"
          onClick={() => {
            setShowLoginModal(false);
            setShowSignupModal(false);
          }}
        />
      )}
    </>
  );
}
