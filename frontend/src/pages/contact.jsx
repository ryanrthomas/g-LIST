import { connectSocket } from "../services/socketClient";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/contact.css";
import NavBar from "../components/navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_DEV;

export default function Contact() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("contact-page");
    return () => document.body.classList.remove("contact-page");
  }, []);

  const onSubmit = async (data) => {
    try {
      // Optional: post to backend
      // await axios.post(`${API_BASE_URL}/contact`, {
      //   name: data.name,
      //   email: data.email,
      //   subject: data.subject,
      //   message: data.message,
      // });
      alert("Thank you! Your message has been received (simulated).");
    } catch (err) {
      alert("Failed to send message. " + (err.response?.data?.message || err.message));
    }
  };

  // NEW: single Home link for the NavBar (replace any About/Contact links)
  const contactPageLinks = [
    { to: "/", label: "Home" }
  ];

  return (
    <div className="contact-container">
      <NavBar rightLinks={contactPageLinks} />

      <main>
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <Link to="/" className="home-btn" aria-label="Go to home">Home</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="contact-form" noValidate>
          <h2>We'd love to hear from you!</h2>
          <p>The G List is a mobile-friendly app that helps your create, send,  and share grocery store lists anytime, anywhere. Whether you have a question about features, need help with an order, or want to share feedback, our team is here to help. Reach out to us by sending an email to support@theglist.app and we’ll get back to you as soon as possible. Your input helps us make grocery planning easier for everyone!</p>

          <div className="form-field">
            <input {...register("name", { required: true })} placeholder="Your Name" />
            {errors.name && <span className="error">Name is required</span>}
          </div>

          <div className="form-field">
            <input {...register("email", { required: true })} placeholder="Your Email" type="email" />
            {errors.email && <span className="error">Email is required</span>}
          </div>

          <div className="form-field">
            <input {...register("subject", { required: true })} placeholder="Subject" />
            {errors.subject && <span className="error">Subject is required</span>}
          </div>

          <div className="form-field message-outline">
            <textarea {...register("message", { required: true })} placeholder="Your Message" rows={6} />
            {errors.message && <span className="error">Message is required</span>}
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </main>
    </div>
  );
}