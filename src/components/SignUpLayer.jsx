import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const SignUpLayer = ({ handleSubmit }) => {
  const [role, setRole] = useState(null); // Start with null to ensure role is selected

  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img src="assets/images/auth/auth-img.png" alt="" />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <div>
            <Link href="/" className="mb-40 max-w-290-px">
              <img src="assets/images/logo.png" alt="" />
            </Link>
            <h4 className="mb-12">Sign Up to your Account</h4>
            <p className="mb-32 text-secondary-light text-lg">
              Welcome back! please enter your details
            </p>
          </div>

          {/* Role Selection Buttons */}
          <div className="d-flex justify-content-around mb-4">
            <button
              className={`btn ${role === "patient" ? "btn-primary" : "btn-light"}`}
              onClick={() => setRole("patient")}
            >
              Patient Sign Up
            </button>
            <button
              className={`btn ${role === "volunteer" ? "btn-primary" : "btn-light"}`}
              onClick={() => setRole("volunteer")}
            >
              Volunteer Sign Up
            </button>
          </div>

          {/* Patient or Volunteer Form based on selected role */}
          {role && (
            <form onSubmit={(e) => handleSubmit(e, role)}>
              {/* Common Fields */}
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="f7:person" />
                </span>
                <input
                  type="text"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Username"
                  name="name"
                />
              </div>

              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Email"
                  name="email"
                />
              </div>

              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="bx:phone" />
                </span>
                <input
                  type="text"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Phone"
                  name="phone"
                />
              </div>

              {/* Fields for Volunteer */}
              {role === "volunteer" && (
                <>
                  <div className="icon-field mb-16">
                    <span className="icon top-50 translate-middle-y">
                      <Icon icon="f7:star" />
                    </span>
                    <input
                      type="text"
                      className="form-control h-56-px bg-neutral-50 radius-12"
                      placeholder="Volunteer Type"
                      name="volunteerType"
                    />
                  </div>

            
                </>
              )}

              {/* Fields for Patient */}
              {role === "patient" && (
                <>
                 

                  <div className="icon-field mb-16">
                    <span className="icon top-50 translate-middle-y">
                      <Icon icon="bi:calendar" />
                    </span>
                    <input
                      type="date"
                      className="form-control h-56-px bg-neutral-50 radius-12"
                      name="dateOfBirth"
                    />
                  </div>

                  <div className="icon-field mb-16">
                    <span className="icon top-50 translate-middle-y">
                      <Icon icon="fluent:home-16-regular" />
                    </span>
                    <input
                      type="text"
                      className="form-control h-56-px bg-neutral-50 radius-12"
                      placeholder="Address"
                      name="address"
                    />
                  </div>
                </>
              )}

              {/* Password Field */}
              <div className="mb-20">
                <div className="position-relative">
                  <div className="icon-field">
                    <span className="icon top-50 translate-middle-y">
                      <Icon icon="solar:lock-password-outline" />
                    </span>
                    <input
                      type="password"
                      className="form-control h-56-px bg-neutral-50 radius-12"
                      id="your-password"
                      placeholder="Password"
                      name="password"
                    />
                  </div>
                  <span className="mt-12 text-sm text-secondary-light">
                    Your password must have at least 8 characters
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              >
                Sign Up
              </button>
            </form>
          )}

          <div className="mt-32 text-center text-sm">
            <p className="mb-0">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary-600 fw-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpLayer;
