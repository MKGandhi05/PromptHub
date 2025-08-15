import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { ReactTyped as Typed } from "react-typed";
import { toast, ToastContainer } from "react-toastify";
import { setAccessToken, setRefreshToken, clearTokens } from "../utils/tokenManager";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true); // ✅ Start loading here

  try {
    const res = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("✅ Login successful! Redirecting...", { autoClose: 2000 });
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => navigate("/"), 2000);
    } else {
  if (data.error) clearTokens();
  toast.error(data.error || "Invalid email or password");
    }
  } catch (err) {
  clearTokens();
  toast.error("🚨 Server error. Please try again.");
  } finally {
    setLoading(false); // ✅ Stop loading after response
  }
};


  return (
    <div className="min-h-screen flex bg-[#0e0e10] text-white font-rajdhani">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" theme="dark" />
      {/* LEFT - Animated Glow + Prompt */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden bg-[#0e0e10]">
        <div className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#2bd4c5] via-[#6c63ff] to-[#2bd4c5] opacity-30 blur-[180px] animate-glow-move"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#6c63ff]/40 blur-[120px] animate-glow-move-delayed"></div>
        <div className="relative z-10 w-3/4 max-w-md bg-white text-black rounded-full px-5 py-3 flex justify-between items-center shadow-2xl border border-white/20">
          <Typed
            strings={[
              "Ask PromptProbe: Which model is smarter?",
              "Compare GPT-4, Claude, Gemini in one go...",
              "One prompt → Multiple AI insights 🚀",
              "Discover the best AI for your needs instantly.",
            ]}
            typeSpeed={50}
            backSpeed={30}
            loop
            className="bg-transparent flex-grow outline-none text-sm font-medium"
          />
          <button className="bg-[#2bd4c5] text-black rounded-full p-2 hover:bg-[#25bfb1] transition-all">
            ↑
          </button>
        </div>
      </div>

      {/* RIGHT - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/logo.png" alt="PromptProbe" className="w-8 h-8" />
            <h2 className="text-xl font-orbitron font-bold">
              Prompt<span className="text-[#2bd4c5]">Probe</span>
            </h2>
          </div>

          <h1 className="text-3xl font-bold mb-6">Log In</h1>

          <button className="w-[90%] flex items-center justify-center gap-2 border border-white/20 py-3 rounded-lg hover:bg-white/10 mb-3 transition-all">
            <FcGoogle size={20} /> Continue with Google
          </button>

          <div className="flex items-center my-4 w-[90%]">
            <span className="flex-grow h-px bg-white/10"></span>
            <span className="mx-2 text-xs text-blue-200">OR</span>
            <span className="flex-grow h-px bg-white/10"></span>
          </div>

          {/* Login Inputs */}
          <form className="flex flex-col gap-3 w-[90%]" onSubmit={handleLogin}>
            <label className="text-sm text-blue-200">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="px-4 py-2 rounded bg-[#1a1a1d] border border-white/10 focus:outline-none focus:border-[#2bd4c5] text-white"
              required
            />

            <label className="text-sm text-blue-200">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="px-4 py-2 rounded bg-[#1a1a1d] border border-white/10 focus:outline-none focus:border-[#2bd4c5] text-white"
              required
            />

            <button
              type="submit"
              disabled={loading} // ✅ Disable while loading
              className={`bg-[#2bd4c5] text-black font-semibold py-2 rounded transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#25bfb1]"
              }`}
            >
              {loading ? "Logging in..." : "Log In"} {/* ✅ Dynamic text */}
            </button>
          </form>

          <p className="mt-4 text-sm text-blue-200">
            <button
              onClick={() => navigate("/signup")}
              className="text-[#2bd4c5] hover:underline"
            >
              Create Your Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
