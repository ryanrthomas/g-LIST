import { connectSocket } from "../services/socketClient";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "../css/login.css"
import NavBar from "../components/navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_DEV;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // ... existing login logic ...
  };

  // Right-side links for the login page: About -> Learn More, Contact
  const loginPageLinks = [
    { to: "/learnmore", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="login-container">
      <NavBar rightLinks={loginPageLinks} />

      <main>
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <Link to="/" className="home-btn" aria-label="Go to home">Home</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Login</h2>
          <input {...register("email", { required: true })} placeholder="Email" type="email" />
          {errors.email && <span>Email is required</span>}
          <input {...register("password", { required: true })} placeholder="Password" type="password" />
          {errors.password && <span>Password is required</span>}
          <button type="submit">Login</button>
        </form>

        <div className="divider-with-or" aria-label="or divider">
          <span className="line" />
          <span className="or-text">or</span>
          <span className="line" />
        </div>

        <div className="signup-cta" style={{ textAlign: "center", marginTop: 12 }}>
          <button className="btn" onClick={() => navigate("/signup")} type="button">
            Sign Up
          </button>
        </div>
      </main>
    </div>
  );
}