"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiFileText, FiCheckSquare, FiEdit3, FiMoon, FiSun, FiHome, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useState, useEffect } from "react";

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
  // const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // useEffect(() => {
  //   document.documentElement.classList.toggle("dark", darkMode);
  // }, [darkMode]);

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
        </nav>

        <div className="mt-auto border-t border-white/10 pt-2 px-2">
          {/* Dark mode button */}
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg transition w-full
              ${!isOpen ? 'justify-center' : ''}`}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            {isOpen && (darkMode ? "Light Mode" : "Dark Mode")}
          </button> */}

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
