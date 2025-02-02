"use client";
import Sidebar from "../components/dashboard/Sidebar";
import { useEffect } from "react";
import Script from "next/script";

export default function DashboardLayout({ children }) {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en" },
            "google_translate_element"
          );
        };

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.head.appendChild(script);
      }
    };

    addGoogleTranslateScript();
  }, []);
  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-16 md:pt-2 bg-[#403cd5]/5">
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="beforeInteractive"
      />
      <Sidebar className="hidden md:block" />{" "}
      {/* Hide sidebar on smaller screens */}
      <div id="google_translate_element" style={{ display: "none" }}></div>
      <div className="flex-1 md:ml-64">
        {" "}
        {/* Adjust margin for responsive design */}
        <main className="p-4 md:p-8 mt-4 md:mt-8">{children}</main>
      </div>
    </div>
  );
}
