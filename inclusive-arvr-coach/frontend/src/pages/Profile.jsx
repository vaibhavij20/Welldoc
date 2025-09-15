// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, setUser, clearAll } from "../lib/userStore";
import TwoFactorSetup from "../components/TwoFactorSetup";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", disability: "" });
  const nav = useNavigate();

  useEffect(() => {
    const u = getUser();
    if (!u || !u.email) nav("/auth");
    else setUser(u);
  }, []);

  const save = () => {
    setUser(user);
    alert("Profile saved!");
  };

  const logout = () => {
    clearAll();
    nav("/");
  };

  return (
    <div>
      <h2>Profile</h2>
      <div className="form">
        <label>Name</label>
        <input
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <label>Email</label>
        <input
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <label>Disability</label>
        <input
          value={user.disability}
          onChange={(e) => setUser({ ...user, disability: e.target.value })}
        />

        <button className="btn" onClick={save}>
          Save
        </button>
        <button className="btn secondary" onClick={logout}>
          Log out
        </button>
      </div>
      
      <TwoFactorSetup />
    </div>
  );
}
