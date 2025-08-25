import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/welcome.css"; // Make sure this is the only CSS import
import NavBar from "../components/navbar";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="welcome-root">
      <div className="welcome-page">
        <nav className="top-nav">
          <div className="nav-links">
            <a href="#" onClick={() => navigate("/grocerylist")}>My List</a>
            <a href="#" onClick={() => navigate("/groups")}>View Groups</a>
            <a href="#" className="signout" onClick={() => {
              localStorage.removeItem("user_id");
              localStorage.removeItem("access_token");
              navigate("/");
            }}>Sign Out</a>
          </div>
          <div className="learn-more-btn">
            <a href="/learnmore" className="btn">Learn More</a>
          </div>
        </nav>
        <main className="welcome-content">
          <h1>Welcome!</h1>
          <p>Use the navigation above to manage your grocery lists and groups.</p>
        </main>
      </div>
    </div>
  );
}