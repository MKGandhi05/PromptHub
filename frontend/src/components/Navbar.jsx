import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";
import { clearTokens } from "../utils/tokenManager";

const Navbar = ({ user: userProp, setUser: setUserProp }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ If no user is passed as prop, manage locally
  const [user, setUserState] = useState(userProp || null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Helper to update user state
  const updateUser = useCallback(
    (u) => {
      if (setUserProp) setUserProp(u);
      setUserState(u);
    },
    [setUserProp]
  );

  // ✅ Detect user from localStorage on mount & listen for changes
  useEffect(() => {
    // Always check localStorage for user on mount (for persistence after refresh)
    const storedUser = localStorage.getItem("user");
    if (storedUser) updateUser(JSON.parse(storedUser));
    else updateUser(null);

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      updateUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [updateUser]);

  // ✅ Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Logout logic
  const handleLogout = () => {
    clearTokens();
    updateUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  const navItems = [
    { name: "Playground", path: "/playground" },
    { name: "History", path: "/history" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#0f2027]/90 shadow-lg py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* ✅ Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <img
            src={logo}
            alt="PromptProbe Logo"
            className="w-10 h-10 transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
          />
          <span className="font-orbitron text-xl md:text-2xl font-bold text-white tracking-wide">
            Prompt<span className="text-[#30e3ca]">Probe</span>
          </span>
        </Link>

        {/* ✅ Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`font-spacegrotesk text-white text-sm font-medium hover:text-[#30e3ca] transition-colors duration-200 ${
                location.pathname === item.path ? "text-[#30e3ca]" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* ✅ Auth Links */}
          {user ? (
            <>
              <span className="text-[#30e3ca] font-semibold">👋 {user.username}</span>
              <button
                onClick={handleLogout}
                className="text-white border border-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-white text-white px-4 py-2 rounded-md hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#30e3ca] text-black font-semibold px-4 py-2 rounded-md hover:bg-[#2bcdb7] transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* ✅ Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-[#0f2027]/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-6 text-white font-spacegrotesk text-xl">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`hover:text-[#30e3ca] transition-colors ${
                location.pathname === item.path ? "text-[#30e3ca]" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <>
              <span className="text-[#30e3ca] text-lg">👋 {user.username}</span>
              <button
                onClick={handleLogout}
                className="hover:text-red-400 text-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
