import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ rightLinks }) => {
  const links = rightLinks && rightLinks.length ? rightLinks : [
    { to: "/grocerylists", label: "My Lists" },
    { to: "/signup", label: "Sign Up" },
    { to: "/login", label: "Login" },
  ];

  return (
    <nav>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ margin: 0, color: '#d1f5be', fontSize: 40 }}>The G List</h1>
          <img src="/src/assets/glistphoto.png" alt="G List" style={{ height: 40, width: 'auto' }} />
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: 12 }}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="btn">{l.label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;