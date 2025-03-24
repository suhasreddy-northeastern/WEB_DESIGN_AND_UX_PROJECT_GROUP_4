import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Header and Navbar */}
      <Header />
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow p-6">
        <Outlet />
      </main>
      
      {/* Footer (Optional) */}
      <footer className="bg-gray-900 text-white text-center py-4 text-sm">
        © {new Date().getFullYear()} HomeFit. All Rights Reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
