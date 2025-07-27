import React from "react";

const AuthPromptCard = ({ onLogin, onSignup, onClose }) => (
  <div className="bg-[#181a20] rounded-xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
    <button
      className="absolute top-3 right-3 text-2xl text-white/70 hover:text-[#2bd4c5]"
      onClick={onClose}
      aria-label="Close"
    >
      &times;
    </button>
    <h2 className="text-2xl font-bold mb-4 text-center">Sign in to Compare</h2>
    <p className="text-blue-200 mb-6 text-center">You need to be logged in to compare model responses.<br/>Please login or sign up to continue.</p>
    <div className="flex gap-4 w-full justify-center">
      <button className="bg-[#2bd4c5] text-black font-semibold py-2 px-6 rounded hover:bg-[#25bfb1]" onClick={onLogin}>Login</button>
      <button className="bg-[#6c63ff] text-white font-semibold py-2 px-6 rounded hover:bg-[#5547c3]" onClick={onSignup}>Sign Up</button>
    </div>
  </div>
);

export default AuthPromptCard;
