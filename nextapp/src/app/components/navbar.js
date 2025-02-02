"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { FaLanguage } from "react-icons/fa";
import { toast } from 'react-hot-toast'

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar if we're on dashboard routes
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu toggle
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const translateRef = useRef(null);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'as', name: 'অসমীয়া' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ks', name: 'كٲشُر' },
    { code: 'kok', name: 'कोंकणी' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ne', name: 'नेपाली' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'sa', name: 'संस्कृत' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ur', name: 'اردو' },
  ];

  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(languages.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    return languages.slice(start, start + ITEMS_PER_PAGE);
  };

  // Check login status
  useEffect(() => {
    const user = sessionStorage.getItem("user-auth-token");
    const admin = sessionStorage.getItem("admin-auth-token");
    console.log(user, admin);
    setIsLoggedIn(!!user);
    setIsAdminLoggedIn(!!admin);
  }, [pathname]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const handleAdminLogout = () => {
    sessionStorage.clear();
    setIsAdminLoggedIn(false);
    window.location.href = "/";
  };

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsTranslateOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (translateRef.current && !translateRef.current.contains(event.target)) {
        setIsTranslateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    toast(`Translating page to ${langCode}`);
    if (typeof window !== 'undefined' && window.google) {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    }
    setIsTranslateOpen(false);
  };

  const handleMobileLanguageChange = (langCode) => {
    handleLanguageChange(langCode);
    setIsMenuOpen(false);
    setIsTranslateOpen(false);
  };

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en' },
            'google_translate_element'
          );
        };

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.head.appendChild(script);
      }
    };

    addGoogleTranslateScript();
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 px-6 sm:px-8 py-4 flex justify-between items-center transition-all duration-300 ${
        isScrolled ? "bg-black bg-opacity-60 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="/images/logo.jpg" // Replace with your logo image
          alt="Logo"
          className="w-10 h-10 md:w-16 md:h-26 mx-auto md:mx-0 mb-4 shadow-md rounded-md"
        />
        <span className="text-lg font-bold tracking-wide text-white">
          Sathi
        </span>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Navigation Links - Desktop */}
      <ul className="hidden sm:flex space-x-8 text-sm sm:text-base">
        {[
          { href: "/", label: "HOME" },
          { href: "/dashboard/recommend-policy", label: "GET POLICIES" },
          { href: "/dashboard/apply-policy", label: "APPLY POLICIES" },
          { href: "/dashboard/voting-policy", label: "VOTE POLICIES" },
          { href: "#aboutus", label: "ABOUT US" },
          { href: "/dashboard/profile", label: "PROFILE" },
        ].map(({ href, label }) => (
          <li key={href}>
            <Link 
              href={href} 
              className="text-white text-opacity-75 hover:text-opacity-100 hover:scale-110 transition-all duration-300"
            >
              {label}
            </Link>
          </li>
        ))}
        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTranslateOpen(!isTranslateOpen)}
            className="flex items-center space-x-2 text-white text-opacity-75 hover:text-opacity-100 transition-all duration-300"
          >
            <FaLanguage size={16} />
            <span>Translate</span>
            <ChevronDown size={16} className={`transform transition-transform duration-300 ${isTranslateOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTranslateOpen && (
            <div ref={translateRef} className="absolute right-0 mt-2 w-72 bg-white text-black rounded-lg shadow-lg p-4">
              <div className="grid grid-cols-3 gap-2">
                {getCurrentPageItems().map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="px-3 py-2 text-sm hover:bg-[#8974e8] hover:text-white hover:scale-105 active:bg-[#6e1cba] transition duration-300 rounded"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className="text-gray-600 hover:text-[#8974e8] disabled:opacity-50"
                  disabled={currentPage === 0}
                >
                  ←
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-2 h-2 rounded-full ${
                        currentPage === i ? 'bg-[#8974e8]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  className="text-gray-600 hover:text-[#8974e8] disabled:opacity-50"
                  disabled={currentPage === totalPages - 1}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </ul>

      {/* User Login/Signup & Admin Login - Desktop */}
      <div className="hidden sm:flex space-x-4">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-white border border-[#8974e8] rounded-full hover:bg-[#8974e8] hover:text-black transition-all duration-300"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="px-6 py-2 text-white border border-[#8974e8] rounded-full hover:bg-[#8974e8] hover:text-black transition-all duration-300"
          >
            Login
          </Link>
        )}

        {isAdminLoggedIn ? (
          <button
            onClick={handleAdminLogout}
            className="px-5 py-2 text-white border border-[#8974e8] rounded-full hover:bg-[#8974e8] hover:text-black transition-all duration-300"
          >
            Admin Logout
          </button>
        ) : (
          <Link
            href="/admin/login"
            className="px-5 py-2 text-white border border-[#8974e8] rounded-full hover:bg-[#8974e8] hover:text-black transition-all duration-300"
          >
            Login as Admin
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-black bg-opacity-90 backdrop-blur-md p-6 flex flex-col space-y-4 sm:hidden">
          {[
            { href: "/", label: "HOME" },
            { href: "/reports", label: "REPORT" },
            { href: "/community", label: "COMMUNITY" },
            { href: "/features", label: "FEATURES" },
            { href: "#aboutus", label: "ABOUT US" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-white text-opacity-75 text-lg text-center hover:text-opacity-100 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="border-t border-gray-600 pt-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsTranslateOpen(!isTranslateOpen);
              }}
              className="w-full flex items-center justify-center space-x-2 text-white text-opacity-75 hover:text-opacity-100 transition-all duration-300"
            >
              <FaLanguage size={20} />
              <span>Select Language</span>
              <ChevronDown 
                size={20} 
                className={`transform transition-transform duration-300 ${isTranslateOpen ? 'rotate-180' : ''}`}
              />
            </button>
            
            {isTranslateOpen && (
              <div 
                className="mt-4 bg-[#1a1a1a] rounded-lg p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-3 gap-2">
                  {getCurrentPageItems().map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleMobileLanguageChange(lang.code)}
                      className="px-3 py-2 text-sm text-white text-opacity-75 hover:text-opacity-100 hover:bg-[#403cd5] active:bg-[#4e49e5] transition-all duration-300 rounded border border-gray-600"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.max(0, prev - 1));
                    }}
                    className="text-white text-opacity-75 hover:text-opacity-100 disabled:opacity-50 transition-all duration-300"
                    disabled={currentPage === 0}
                  >
                    ←
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-2 h-2 rounded-full transition duration-300 ${
                          currentPage === i ? 'bg-[#8974e8]' : 'bg-gray-400 hover:bg-[#8974e8]'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
                    }}
                    className="text-white text-opacity-75 hover:text-opacity-100 disabled:opacity-50 transition-all duration-300"
                    disabled={currentPage === totalPages - 1}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-600">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2 text-white bg-[#3819b4] font-semibold rounded-full shadow-md hover:bg-[#8974e8] hover:scale-105 active:bg-[#6e1cba] transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="px-6 py-2 text-white bg-[#6e1cba] rounded-full hover:bg-[#8974e8] hover:scale-105 active:bg-[#3819b4] transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}

            {isAdminLoggedIn ? (
              <button
                onClick={handleAdminLogout}
                className="px-5 py-2 text-white border-2 border-[#8974e8] rounded-full hover:bg-[#8974e8] hover:scale-105 active:bg-[#6e1cba] transition-all duration-300"
              >
                Admin Logout
              </button>
            ) : (
              <Link
                href="/admin/login"
                className="px-5 py-2 text-white border-2 border-[#8974e8] rounded-full hover:bg-[#8974e8] hover:scale-105 active:bg-[#6e1cba] transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login as Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}