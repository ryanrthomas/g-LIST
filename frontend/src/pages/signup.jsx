import { connectSocket } from "../services/socketClient";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/signup.css"
import NavBar from "../components/navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_DEV;

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Optional: apply a page-specific class to body for styling (as discussed earlier)
  useEffect(() => {
    document.body.classList.add("signup-page");
    return () => document.body.classList.remove("signup-page");
  }, []);

  const onSubmit = async (data) => {
    try {
      // First, sign up the user
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      // Then, sign in the user automatically
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email: data.email,
        password: data.password,
      });
      if (response.data && response.data.data && response.data.data.user && response.data.data.user.id) {
        localStorage.setItem("user_id", response.data.data.user.id);
        if (response.data.data.user.user_code) {
          localStorage.setItem("user_code", response.data.data.user.user_code);
        }
      }
      if (response.data && response.data.data && response.data.data.tokens && response.data.data.tokens.access_token) {
        localStorage.setItem("access_token", response.data.data.tokens.access_token);
      }

      // Connect socket after signup
      const token = response.data.data.tokens?.access_token;
      if (token) connectSocket(token);
      // Notify other components (like UserCodeFooter) to update
      window.dispatchEvent(new Event("user-auth-changed"));
      alert("Signup successful! You are now logged in.");
      navigate("/welcome");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("A user with this email already exists. Please use a different email or log in.");
      } else {
        alert("Signup failed! " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Right-side links for the signup page (adjust as needed)
  const signupPageLinks = [
    { to: "/learnmore", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="signup-container">
      <NavBar rightLinks={signupPageLinks} />

      <main>
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <Link to="/" className="home-btn" aria-label="Go to home">Home</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Sign Up</h2>
          <input {...register("first_name", { required: true })} placeholder="First Name" />
          {errors.first_name && <span>First name is required</span>}
          <input {...register("last_name", { required: true })} placeholder="Last Name" />
          {errors.last_name && <span>Last name is required</span>}
          <input {...register("email", { required: true })} placeholder="Email" type="email" />
          {errors.email && <span>Email is required</span>}
          <input {...register("password", { required: true })} placeholder="Password" type="password" />
          {errors.password && <span>Password is required</span>}
          <button type="submit">Create Account</button>
        </form>

        {/* Optional: keep the same "or" divider and navigation to login as in login.jsx */}
        <div className="divider-with-or" aria-label="or divider" style={{ marginTop: 16 }}>
          <span className="line" />
          <span className="or-text">or</span>
          <span className="line" />
        </div>

        <div className="login-cta" style={{ textAlign: "center", marginTop: 12 }}>
          <button className="btn" onClick={() => navigate("/login")} type="button">
            Log In
          </button>
        </div>
      </main>
    </div>
  );
}