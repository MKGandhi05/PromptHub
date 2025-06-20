import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import openaiLogo from "../assets/openai.png";
import azureLogo from "../assets/azure.png";

const MODELS = [
  {
    provider: "openai",
    label: "GPT-4o",
    description: "Fast, intelligent, flexible GPT model",
    bg: "linear-gradient(120deg, #6ee7b7 0%, #3b82f6 100%)",
    textColor: "#fff",
  },
  {
    provider: "openai",
    label: "o4 – mini",
    description: "Faster, more affordable reasoning model",
    bg: "linear-gradient(120deg, #fdf6e3 0%, #c9d6ff 100%)",
    textColor: "#222",
  },
  {
    provider: "openai",
    label: "GPT-4.1 -mini",
    description: "Balanced for intelligence, speed, and cost",
    bg: "linear-gradient(120deg, #60a5fa 0%, #a7f3d0 100%)",
    textColor: "#fff",
  },
  {
    provider: "azure",
    label: "GPT-4o",
    description: "Fast, intelligent, flexible GPT model",
    bg: "linear-gradient(120deg, #6ee7b7 0%, #3b82f6 100%)",
    textColor: "#fff",
  },
  {
    provider: "azure",
    label: "o4 – mini",
    description: "Faster, more affordable reasoning model",
    bg: "linear-gradient(120deg, #fdf6e3 0%, #c9d6ff 100%)",
    textColor: "#222",
  },
  {
    provider: "azure",
    label: "GPT-35-turbo",
    description: "Faster, more affordable reasoning model",
    bg: "linear-gradient(120deg, #fdf6e3 0%, #c9d6ff 100%)",
    textColor: "#222",
  },
];

export default function Playground() {
  const [selectedModels, setSelectedModels] = useState([]);
  const navigate = useNavigate();

  const handleSelectModel = (model) => {
    setSelectedModels((prev) => {
      const exists = prev.some(
        (m) => m.provider === model.provider && m.label === model.label
      );
      if (exists) {
        return prev.filter(
          (m) => !(m.provider === model.provider && m.label === model.label)
        );
      } else {
        if (prev.length >= 6) return prev; // Max 6 models
        return [...prev, model];
      }
    });
  };

  const handleCompare = () => {
    // Save selected models to localStorage for session page
    localStorage.setItem("selectedModels", JSON.stringify(selectedModels));
    navigate("/playground/session");
  };

  // ModelCard inlined
  const ModelCard = ({
    model,
    provider,
    selected,
    onSelect,
    interactive,
    description,
    bg,
    textColor,
  }) => {
    const [hovered, setHovered] = React.useState(false);
    const logo = provider === "openai" ? openaiLogo : azureLogo;
    return (
      <div
        onClick={() => interactive && onSelect()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          border: selected
            ? "2.5px solid #2563eb"
            : hovered
            ? "2.5px solid #60a5fa"
            : "2.5px solid transparent",
          borderRadius: 16,
          margin: 8,
          background: hovered || selected
            ? "#23233a"
            : "#18181b",
          cursor: "pointer",
          minWidth: 320,
          maxWidth: 340,
          minHeight: 180,
          boxShadow: selected
            ? "0 8px 32px 0 #2563eb44"
            : hovered
            ? "0 6px 24px 0 #60a5fa33"
            : "0 2px 12px 0 #0001",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          transition:
            "box-shadow 0.22s, border 0.22s, background 0.22s, transform 0.18s cubic-bezier(.4,2,.6,1)",
          transform: selected ? "scale(1.045)" : "scale(1)",
        }}
      >
        <img
          src={logo}
          alt={provider + " logo"}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 28,
            height: 28,
            zIndex: 2,
            objectFit: "contain",
            filter: selected ? "drop-shadow(0 0 6px #2563eb88)" : hovered ? "drop-shadow(0 0 4px #60a5fa88)" : "none",
            transition: "filter 0.18s",
          }}
        />
        <div
          style={{
            width: "100%",
            height: 100,
            borderRadius: 12,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              color: textColor,
              fontWeight: 800,
              fontSize: 32,
              letterSpacing: 1,
              textShadow: "0 2px 8px #0002",
            }}
          >
            {model.replace(" -mini", " mini")}
          </span>
        </div>
        <div
          style={{
            color: "#cbd5e1",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 8,
            minHeight: 44,
          }}
        >
          {description}
        </div>
      </div>
    );
  };

  // ModelSelectGrid inlined
  const ModelSelectGrid = ({ selectedModels, onSelect }) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 32,
          marginBottom: 24,
          width: "100%",
          maxWidth: 1050,
          minHeight: 420,
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {MODELS.map((model, idx) => (
          <ModelCard
            key={`${model.provider}-${model.label}`}
            model={model.label}
            provider={model.provider}
            selected={selectedModels.some(
              (m) => m.provider === model.provider && m.label === model.label
            )}
            onSelect={() => onSelect(model)}
            interactive={true}
            description={model.description}
            bg={model.bg}
            textColor={model.textColor}
            style={{
              gridColumn: (idx % 3) + 1,
              gridRow: Math.floor(idx / 3) + 1,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        background:
          "linear-gradient(135deg, #0f2027 0%, #2c5364 60%, #00c6ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: 1200,
          padding: "32px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative", // Added for absolute positioning
          minHeight: 600, // Ensures enough height for button placement
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "2rem",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 32,
            letterSpacing: 0.5,
            textShadow: "0 2px 8px #0006",
          }}
        >
          Select Models to Compare
        </h1>
        <ModelSelectGrid
          selectedModels={selectedModels}
          onSelect={handleSelectModel}
        />
        {selectedModels.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 0,
              bottom: -30,
              zIndex: 10,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <button
              onClick={handleCompare}
              disabled={selectedModels.length === 0}
              style={{
                pointerEvents: "auto",
                padding: "20px 60px",
                fontSize: "1.35rem",
                fontWeight: 800,
                borderRadius: 18,
                background: selectedModels.length === 0
                  ? "#b0b0b0"
                  : "linear-gradient(100deg, #2563eb 30%, #0ea5e9 70%, #38bdf8 100%)",
                color: "#fff",
                border: selectedModels.length === 0 ? "none" : "2.5px solid #38bdf8",
                boxShadow: selectedModels.length === 0
                  ? "0 2px 8px 0 #0002"
                  : "0 8px 32px 0 #38bdf888, 0 2px 8px 0 #2563eb44",
                cursor: selectedModels.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 1,
                textShadow: selectedModels.length === 0 ? "none" : "0 2px 12px #2563eb77",
                position: "relative",
                overflow: "hidden",
                transition:
                  "background 0.25s, box-shadow 0.22s, border 0.22s, transform 0.18s cubic-bezier(.4,2,.6,1), filter 0.18s",
                filter: selectedModels.length === 0 ? "grayscale(0.2)" : "none",
              }}
              onMouseEnter={e => {
                if (selectedModels.length > 0) {
                  e.currentTarget.style.filter = "brightness(1.08) drop-shadow(0 0 16px #38bdf8cc)";
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.background = "linear-gradient(270deg, #2563eb, #0ea5e9, #38bdf8, #2563eb)";
                  e.currentTarget.style.backgroundSize = "400% 400%";
                  e.currentTarget.style.animation = "gradientMove 2.5s ease-in-out infinite";
                }
              }}
              onMouseLeave={e => {
                if (selectedModels.length > 0) {
                  e.currentTarget.style.filter = "drop-shadow(0 0 8px #38bdf8cc)";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "linear-gradient(100deg, #2563eb 30%, #0ea5e9 70%, #38bdf8 100%)";
                  e.currentTarget.style.animation = "none";
                }
              }}
            >
              <span style={{ position: "relative", zIndex: 2 }}>Compare</span>
              {/* Shimmer overlay */}
              {selectedModels.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.18) 100%)",
                  opacity: 0.7,
                  pointerEvents: "none",
                  zIndex: 1,
                  mixBlendMode: "lighten",
                }} />
              )}
              <style>{`
                @keyframes gradientMove {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
