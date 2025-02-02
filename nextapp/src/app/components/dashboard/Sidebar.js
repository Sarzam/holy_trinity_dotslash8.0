"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiFileText, FiCheckSquare, FiEdit3, FiHome, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { FaLanguage } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-hot-toast';

const menuItems = [
  { name: "Home", path: "/", icon: FiHome },
  { name: "Profile", path: "/dashboard/profile", icon: FiUser },
  { name: "Policy", path: "/dashboard/recommend-policy", icon: FiFileText },
  { name: "Voting", path: "/dashboard/voting-policy", icon: FiCheckSquare },
  { name: "Apply Policy", path: "/dashboard/apply-policy", icon: FiEdit3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const translateRef = useRef(null);

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

  const ITEMS_PER_PAGE = 6; // Reduced for sidebar
  const totalPages = Math.ceil(languages.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    return languages.slice(start, start + ITEMS_PER_PAGE);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translateRef.current && !translateRef.current.contains(event.target)) {
        setIsTranslateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.clear();
    // Clear local storage if you're using it
    localStorage.clear();
    // Redirect to home page
    router.push('/');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#403cd5] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX className="text-white" size={24} /> : <FiMenu className="text-white" size={24} />}
          </button>
          <span className="ml-4 text-lg font-semibold text-white">Dashboard</span>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen bg-[#403cd5] flex flex-col transition-all duration-300 z-50
        md:translate-x-0 mt-16 md:mt-0
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:w-16'}`}>
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:flex items-center justify-between px-4 py-6 border-b border-white/10">
          {isOpen && <span className="text-xl font-bold text-white">Dashboard</span>}
          <button 
            className="text-white hover:bg-white/10 p-2 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end px-4 py-2">
          <button 
            className="p-2 text-white hover:bg-white/10 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2 px-2 overflow-y-auto">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <div key={path} className="group relative">
              <Link href={path}>
                <div className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-300
                  ${pathname === path 
                    ? "bg-white text-[#403cd5] font-semibold shadow-lg" 
                    : "text-white hover:bg-white/10"
                  }
                  ${!isOpen ? 'justify-center' : ''}`}
                >
                  <Icon size={20} />
                  {isOpen && <span>{name}</span>}
                </div>
              </Link>
              {!isOpen && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded-lg 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                  {name}
                </div>
              )}
            </div>
          ))}

          {/* Translate Option */}
          <div className="group relative mb-2">
            <button
              onClick={() => setIsTranslateOpen(!isTranslateOpen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full
                text-white hover:bg-white/10
                ${!isOpen ? 'justify-center' : ''}`}
            >
              <FaLanguage size={20} />
              {isOpen && (
                <>
                  <span>Translate</span>
                  <ChevronDown
                    size={16}
                    className={`ml-auto transform transition-transform duration-300 ${
                      isTranslateOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>

            {/* Tooltip for collapsed sidebar */}
            {!isOpen && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded-lg 
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
                Translate
              </div>
            )}

            {/* Language dropdown */}
            {isTranslateOpen && (
              <div
                ref={translateRef}
                className={`absolute ${
                  isOpen ? 'right-0 left-0' : 'left-16'
                } top-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50`}
              >
                <div className="grid grid-cols-2 gap-2">
                  {getCurrentPageItems().map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-[#403cd5] hover:text-white rounded transition duration-300"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    className="text-gray-600 hover:text-[#403cd5] disabled:opacity-50"
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
                          currentPage === i ? 'bg-[#403cd5]' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    className="text-gray-600 hover:text-[#403cd5] disabled:opacity-50"
                    disabled={currentPage === totalPages - 1}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-2 px-2">
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 mb-2 text-white/90 hover:bg-white/10 rounded-lg transition w-full
              ${!isOpen ? 'justify-center' : ''}`}
          >
            <FiLogOut size={20} />
            {isOpen && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
