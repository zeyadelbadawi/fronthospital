  'use client';
  import { Icon } from "@iconify/react/dist/iconify.js";
  import { useState } from "react";
  import Link from "next/link";
  import { useRouter } from "next/navigation"; // Import router for redirection
  import axios from "axios"; // Import axios for making API calls

  const SignInLayer = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(""); // Add state for role selection
    const router = useRouter(); // Initialize router

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      const data = { email, password };
    
      const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/authentication/signin/${role}`;
    
      try {
        const response = await axios.post(loginUrl, data, { withCredentials: true });
    
        const token = response.data.accessToken;
    
        // Save the access token in localStorage (or a cookie, depending on your implementation)
        localStorage.setItem("token", token);
    
        // Redirect based on the role
        if (role === "admin") {
          router.push("http://localhost:3000/");
        } else if (role === "patient") {
          router.push("http://localhost:3000/email");
        } else if (role === "volunteer") {
          router.push("http://localhost:3000/text-generator");
        } else if (role === "doctor") {
          router.push("http://localhost:3000/chat-message");
        }
        else if (role === "accountant") {
          router.push("http://localhost:3000/Payment-Transactions");
        }
    
      } catch (error) {
        console.error(error);
        alert("Error during login. Please check your credentials.");
      }
    };
    
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
              <h4 className="mb-12">Sign In to your Account</h4>
              <p className="mb-32 text-secondary-light text-lg">
                Welcome back! please enter your details
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Set email on change
                />
              </div>

              <div className="position-relative mb-20">
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type="password"
                    className="form-control h-56-px bg-neutral-50 radius-12"
                    id="your-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Set password on change
                  />
                </div>
                <span className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light" />
              </div>

              {/* Role Selection */}
              <div className="mb-16">
                <label htmlFor="role" className="form-label">Select Role</label>
                <select
                  id="role"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  onChange={(e) => setRole(e.target.value)} // Set role on change
                  value={role}
                >
                  <option value="">Select Role</option>
                  <option value="admin">admin</option>
                  <option value="patient">Patient</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="doctor">Doctor</option>
                  <option value="accountant">accountant</option>

                </select>
              </div>

              <div className="">
                <div className="d-flex justify-content-between gap-2">
                  <div className="form-check style-check d-flex align-items-center">
                    <input
                      className="form-check-input border border-neutral-300"
                      type="checkbox"
                      defaultValue=""
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <Link href="#" className="text-primary-600 fw-medium">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              >
                Sign In
              </button>

              <div className="mt-32 text-center text-sm">
                <p className="mb-0">
                  Don’t have an account?{" "}
                  <Link href="/sign-up" className="text-primary-600 fw-semibold">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  };

  export default SignInLayer;
