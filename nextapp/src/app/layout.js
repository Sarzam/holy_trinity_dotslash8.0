"use client";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Toaster } from "react-hot-toast";
import React, { useEffect } from "react";
import Script from "next/script";
import "./globals.css";

// export const metadata = {
//   title: "Sathi",
//   description: "Created by Sathi @ DotSlash 8.0",
// };

export default function RootLayout({ children }) {
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
    <html lang="en">
      <head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`antialiased`}>
        <Navbar />
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Toaster />
        {children}
        <Footer />
      </body>
    </html>
  );
}
