"use client";
import Sidebar from "../components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-16 md:pt-2 bg-[#403cd5]/5">
      <Sidebar className="hidden md:block" /> {/* Hide sidebar on smaller screens */}
      <div className="flex-1 md:ml-64"> {/* Adjust margin for responsive design */}
        <main className="p-4 md:p-8 mt-4 md:mt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
