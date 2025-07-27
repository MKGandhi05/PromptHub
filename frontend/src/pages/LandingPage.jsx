import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import GlowingSeparator from "../components/GlowingSeparator";
import { ReactTyped as Typed } from "react-typed";
import { useNavigate } from "react-router-dom";


const LandingPage = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0e0e10] text-white font-rajdhani">
      <Navbar onLoginClick={() => navigate("/login")} />

      {/* ✅ HERO SECTION */}
      <div className="relative min-h-screen w-full overflow-hidden bg-[#0e0e10]">
        {/* 🔥 Left Dual Glow */}
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#2bd4c5]/30 to-transparent blur-[160px] pulse-glow"></div>
        <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] rounded-full bg-[#2bd4c5]/50 blur-[80px] pulse-glow"></div>

        {/* 🔥 Right Dual Glow */}
        <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-[#6c63ff]/30 to-transparent blur-[160px] pulse-glow"></div>
        <div className="absolute bottom-1/4 -right-32 w-[300px] h-[300px] rounded-full bg-[#6c63ff]/50 blur-[80px] pulse-glow"></div>

        {/* ✅ Two-Column Hero */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-center w-full min-h-screen px-6 md:px-20 pt-24 transition-all duration-1000 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* ✅ Left Column - Text */}
          <div className="flex flex-col justify-center text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg font-orbitron leading-tight">
              The <span className="text-[#2bd4c5]">AI Playground</span> You’ve
              Been Waiting For
            </h1>

            <p className="text-lg md:text-2xl text-blue-100 max-w-lg font-medium font-rajdhani">
              PromptProbe lets you input a single prompt and instantly compare
              responses from OpenAI, Azure, and other cutting-edge models — side
              by side.
            </p>

            <Typed
              strings={[
                "Inspect. Compare. Choose. Decide Smarter.",
                "AI Model Comparison Made Easy.",
                "One Prompt → Multiple Insights.",
              ]}
              typeSpeed={50}
              backSpeed={30}
              loop
              className="text-xl md:text-2xl text-[#2bd4c5] font-spacegrotesk"
            />

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <a
                href="/playground"
                className="px-8 py-4 bg-[#2bd4c5] text-black rounded-lg shadow-lg shadow-[#2bd4c5]/30 text-lg font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-300 hover:bg-[#25bfb1]"
              >
                🚀 Try It Now – Free
              </a>
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-white/10 border border-white/20 text-blue-200 rounded-lg shadow-md text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                type="button"
              >
                Watch Demo →
              </button>
            </div>
          </div>

          {/* ✅ Right Column - Mockup with Strong Aura */}
          <div className="relative flex justify-center md:justify-end">
            {/* Inner Glow Layer */}
            {/* <div className="absolute inset-0 w-[85%] md:w-[520px] lg:w-[620px] mx-auto rounded-full blur-[120px] bg-gradient-to-r from-[#2bd4c5]/40 to-[#6c63ff]/40 pulse-glow"></div> */}

            {/* Playground Image */}
            <img
              src="/assets/playground-preview.png"
              alt="PromptProbe Playground"
              className="relative w-[90%] md:w-[500px] lg:w-[600px] rounded-xl shadow-2xl border border-white/10 transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* ✅ HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-16 bg-[#0e0e10] text-center relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-spacegrotesk font-bold mb-10">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 max-w-7xl mx-auto px-6">
          {[
            {
              img: "/assets/select.png",
              title: "Select",
              desc: "Choose from multiple AI models for comparison.",
            },
            {
              img: "/assets/prompt.png",
              title: "Prompt",
              desc: "Enter your query once to test across models.",
            },
            {
              img: "/assets/compare.png",
              title: "Compare",
              desc: "Analyze and choose the best model output.",
            },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* ✅ Larger Laptop Screenshot */}
              <div className="w-full max-w-[500px] aspect-[16/9] border-2 border-white/20 rounded-lg overflow-hidden shadow-xl hover:shadow-[#2bd4c5]/50 transition-all duration-300 hover:scale-105">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-2xl font-bold">{step.title}</h3>

              {/* Description */}
              <p className="mt-3 text-blue-200 max-w-[400px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ GLOWING SEPARATOR */}
      <GlowingSeparator
        className="my-16"
        style={{ maxWidth: "1440px", margin: "0 auto" }}
      />
      {/* ✅ FEATURES */}
      <section className="py-16 bg-[#0e0e10] text-center">
        <h2 className="text-3xl md:text-4xl font-spacegrotesk font-bold mb-10">
          Why PromptProbe?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {[
            {
              title: "⚡ Multi-model Comparison",
              desc: "Compare responses from OpenAI, Azure, and more — side by side.",
            },
            {
              title: "🔐 Secure & Reliable",
              desc: "All requests are securely processed with API-level security.",
            },
            {
              title: "🚀 Fast & Customizable",
              desc: "Enjoy fast responses with future BYOK (Bring Your Own Key) support.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-[#0e0e10]/60 border border-white/10 hover:border-[#2bd4c5]/40 shadow-md transition-all"
            >
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-blue-200">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ GLOWING SEPARATOR */}
      <GlowingSeparator
        className="my-16"
        style={{ maxWidth: "1440px", margin: "0 auto" }}
      />

      {/* ✅ PRICING */}
      <section className="py-16 bg-[#0e0e10] text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-spacegrotesk font-bold mb-4">
          Start Free – Upgrade Anytime
        </h2>
        <p className="text-blue-200 mb-8">
          Get 3 free trials to test PromptProbe before choosing a plan.
        </p>
        <div className="max-w-md mx-auto bg-[#1a1a1d]/80 p-6 rounded-xl border border-white/10 hover:border-[#2bd4c5]/40 shadow-lg transition-all">
          <h3 className="text-xl font-bold mb-2">Free Trial</h3>
          <p className="text-blue-200 mb-4">
            3 free comparisons • No credit card required
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-[#2bd4c5] text-black rounded-lg font-semibold hover:bg-[#25bfb1] shadow-md transition-all"
            type="button"
          >
            Sign Up Now
          </button>
        </div>
      </section>
      {/* (Removed old showAuth modal logic) */}
      {/* ✅ FOOTER */}
      <footer className="bg-[#0e0e10  ] text-blue-200 py-6 text-center border-t border-white/10">
        <p>
          &copy; {new Date().getFullYear()} PromptProbe. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 mt-2 text-sm">
          <a href="/about" className="hover:text-[#2bd4c5]">
            About
          </a>
          <a href="/terms" className="hover:text-[#2bd4c5]">
            Terms
          </a>
          <a href="/privacy" className="hover:text-[#2bd4c5]">
            Privacy
          </a>
          <a href="/contact" className="hover:text-[#2bd4c5]">
            Contact
          </a>
        </div>
      </footer>
      {/* (Login modal removed; routing now handles login/signup) */}
    </div>
  );
};

export default LandingPage;
