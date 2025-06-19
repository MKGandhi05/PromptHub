import React from "react";

const LandingPage = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#00c6ff] overflow-hidden"
      style={{ minHeight: "100vh", height: "100vh" }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-4 tracking-tight" style={{ letterSpacing: "0.02em" }}>
          PromptHub <span className="text-blue-200">:</span> <span className="text-blue-300">Multi LLM Playground</span>
        </h1>
        <p className="text-lg md:text-2xl text-blue-100 text-center max-w-2xl mb-10 font-medium">
          Supercharge your productivity with AI-powered prompts and seamless workflow integration.
          <br />
          Discover, create, and compare prompts with ease.
        </p>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <a
            href="/playground"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
          >
            Try the Playground
          </a>
          <a
            href="#about"
            className="px-8 py-4 bg-white/80 border border-blue-600 text-blue-700 rounded-lg shadow-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.17)" }}
          >
            Learn More
          </a>
        </div>
        <footer className="text-blue-100 text-sm opacity-80 mt-8">
          &copy; {new Date().getFullYear()} PromptHub. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
