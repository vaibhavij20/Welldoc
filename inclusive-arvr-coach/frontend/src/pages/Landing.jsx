// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  console.log('Landing component rendering');
  return (
    <div className="container">
      <section className="hero">
        <h1>Inclusive AR/VR Coach</h1>
        <p>
          Our mission is to empower people with disabilities through immersive,
          inclusive, and adaptive digital environments.
        </p>
        <div style={{ marginTop: "20px" }}>
          <Link to="/auth">
            <button className="btn">Get Started</button>
          </Link>
        </div>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Why this matters</h2>
        <ul>
          <li>Accessibility boosts independence and confidence</li>
          <li>Inclusive participation fosters equity and empowerment</li>
          <li>Immersive AR/VR helps practice real-world scenarios safely</li>
        </ul>
      </section>
    </div>
  );
}

