
import React from "react";

const GlowingSeparator = ({ className = "", style = {} }) => (
  <div className={`w-full flex justify-center ${className}`} style={style}>
    <svg
      width="100%"
      height="32"
      viewBox="0 0 1440 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: "1440px" }}
    >
      
      {/* Straight line, thickest in the center, fading at ends */}
      <line
        x1="40"
        y1="16"
        x2="1400"
        y2="16"
        stroke="url(#glow-radial)"
        strokeWidth="12"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      {/* Crisp center line overlay */}
      <line
        x1="40"
        y1="16"
        x2="1400"
        y2="16"
        stroke="#2bd4c5"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  </div>
);

export default GlowingSeparator;
