import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { ReactTyped as Typed } from "react-typed";
import { toast, ToastContainer } from "react-toastify";
import { clearTokens } from "../utils/tokenManager";
import "react-toastify/dist/ReactToastify.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Start loading here

    const userData = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Signup successful! Redirecting...", { autoClose: 2000 });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        clearTokens();
        toast.error(data.error || "Signup failed. Try again.");
      }
    } catch (err) {
      clearTokens();
      toast.error("🚨 Server error. Please try again.");
    } finally {
      setLoading(false); // ✅ Stop loading after request
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0e0e10] text-white font-rajdhani">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" theme="dark" />

      {/* LEFT - Animated Glow */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden bg-[#0e0e10]">
        <div className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#2bd4c5] via-[#6c63ff] to-[#2bd4c5] opacity-30 blur-[180px] animate-glow-move"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#6c63ff]/40 blur-[120px] animate-glow-move-delayed"></div>

        <div className="relative z-10 w-3/4 max-w-md bg-white text-black rounded-full px-5 py-3 flex justify-between items-center shadow-2xl border border-white/20">
          <Typed
            strings={[
              "Sign up to compare AI models instantly...",
              "Create your account to unlock PromptProbe.",
              "One signup → Start comparing multiple AIs.",
              "Join PromptProbe and test AI side-by-side!",
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

      {/* RIGHT - Signup Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <img src="/assets/logo.png" alt="PromptProbe" className="w-8 h-8" />
            <h2 className="text-xl font-orbitron font-bold">
              Prompt<span className="text-[#2bd4c5]">Probe</span>
            </h2>
          </div>

          <h1 className="text-3xl font-bold mb-6">Create Account</h1>

          {/* Google Auth */}
          <button className="w-[90%] flex items-center justify-center gap-2 border border-white/20 py-3 rounded-lg hover:bg-white/10 mb-3 transition-all">
            <FcGoogle size={20} /> Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4 w-[90%]">
            <span className="flex-grow h-px bg-white/10"></span>
            <span className="mx-2 text-xs text-blue-200">OR</span>
            <span className="flex-grow h-px bg-white/10"></span>
          </div>

          {/* Signup Inputs */}
          <form className="flex flex-col gap-3 w-[90%]" onSubmit={handleSignup}>
            <label className="text-sm text-blue-200">Full Name</label>
            <input
              name="username"
              type="text"
              placeholder="Your Name"
              className="px-4 py-2 rounded bg-[#1a1a1d] border border-white/10 focus:outline-none focus:border-[#2bd4c5] text-white"
              required
            />

            <label className="text-sm text-blue-200">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="px-4 py-2 rounded bg-[#1a1a1d] border border-white/10 focus:outline-none focus:border-[#2bd4c5] text-white"
              required
            />

            <label className="text-sm text-blue-200">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="px-4 py-2 rounded bg-[#1a1a1d] border border-white/10 focus:outline-none focus:border-[#2bd4c5] text-white"
              required
            />

            <button
              type="submit"
              disabled={loading} // ✅ Disable button during loading
              className={`bg-[#2bd4c5] text-black font-semibold py-2 rounded transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#25bfb1]"
              }`}
            >
              {loading ? "Creating account..." : "Sign Up"} {/* ✅ Dynamic text */}
            </button>
          </form>

          {/* Redirect to Login */}
          <p className="mt-4 text-sm text-blue-200">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#2bd4c5] hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
