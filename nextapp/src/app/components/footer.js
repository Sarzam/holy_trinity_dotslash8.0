"use client";

import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#2627bf] text-[#F5F7F2] py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
        {/* Logo and Description */}
        <div className="text-center md:text-left">
          <img
            // Replace with your logo image
            src="/images/logo.jpg"
            alt="Logo"
            className="w-16 h-16 mx-auto md:mx-0 mb-4 shadow-md rounded-sm"
          />
          <h3 className="text-xl font-bold">Sathi</h3>
          <p className="text-sm text-[#D1C4E9] mt-2 max-w-sm mx-auto md:mx-0">
            Enhancing public administration through digital innovation,
            transparency, and citizen engagement.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { href: "/", label: "Home" },
              { href: "/dashboard/recommend-policy", label: "Get Policies" },
              { href: "/dashboard/apply-policy", label: "Apply for Policies" },
              { href: "/dashboard/voting-policy", label: "Vote for Policies" },
              { href: "/aboutus", label: "About Us" },
              { href: "/dashboard/profile", label: "Profile" },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-[#D1C4E9] hover:text-[#B39DDB] transition duration-300"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media Links */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
          <div className="flex justify-center md:justify-start space-x-6">
            {[
              { href: "https://facebook.com", icon: <FaFacebook size={24} /> },
              { href: "https://twitter.com", icon: <FaTwitter size={24} /> },
              {
                href: "https://instagram.com",
                icon: <FaInstagram size={24} />,
              },
              { href: "https://linkedin.com", icon: <FaLinkedin size={24} /> },
            ].map(({ href, icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D1C4E9] hover:text-[#B39DDB] transition duration-300"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 border-t border-[#B39DDB] pt-6 text-center">
        <p className="text-sm text-[#D1C4E9]">
          &copy; {new Date().getFullYear()} Sathi. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
