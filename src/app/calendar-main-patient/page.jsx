"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/helper/axiosSetup";
import Header from "@/components/Header";
import CalendarMainLayerPatient from "@/components/CalendarMainLayerPatient";

export default function Page() {
  // — Auth State & Handlers (same as ClientPortalPage) —
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signName, setSignName] = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signPhone, setSignPhone] = useState("");
  const [signGender, setSignGender] = useState("");
  const [signPassword, setSignPassword] = useState("");
  const [signConfirm, setSignConfirm] = useState("");

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);
    try {
      const { data } = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
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
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/authentication/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      setUser(null);
      setShowLoginModal(false);
      setShowSignupModal(false);
    } catch (err) {
      console.error(err);
    }
  };

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

  const onSignup = async (e) => {
    e.preventDefault();
    if (signPassword !== signConfirm) {
      return alert("Passwords don’t match");
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
      alert("Registered—please log in");
      setShowSignupModal(false);
      setShowLoginModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <>
        <Header
          user={user}
          loading={loading}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
        />


        {/* Main Content */}
        <CalendarMainLayerPatient />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal fade show d-block" tabIndex="-1">
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
                  <button type="submit" className="btn btn-primary w-100">
                    Login
                  </button>
                </form>
                <div className="text-center mt-2">
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
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="modal fade show d-block" tabIndex="-1">
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
                      <option value="other">Other</option>
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
      )}

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
