import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png"; // Your logo path

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // replace with real auth later

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        {/* Left: Logo + Name */}
        <Link to="/" className="flex items-center space-x-2 group">
          <img
            src={logo}
            alt="PromptProbe Logo"
            className="w-10 h-10 transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
          />
          <span className="font-orbitron text-xl md:text-2xl font-bold text-white tracking-wide">
            Prompt
            <span className="text-[#30e3ca]">Probe</span>
          </span>
        </Link>

        {/* Desktop Nav */}
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

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-white px-4 py-2 rounded-md hover:text-[#30e3ca]"
              >
                Profile
              </Link>
              <button className="text-white border border-white px-4 py-2 rounded-md hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-white text-white px-4 py-2 rounded-md hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#30e3ca] text-black font-semibold px-4 py-2 rounded-md hover:bg-[#2bcdb7]"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
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

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <button className="hover:text-red-400">Logout</button>
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
