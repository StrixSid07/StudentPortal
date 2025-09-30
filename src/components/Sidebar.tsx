import React, { useState } from "react";
import { Avatar, Button } from "flowbite-react";
import { Menu, X, Book, LogOut, FileText, Phone, Shield, Wifi, WifiOff, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface UserData {
  id: string;
  fullname: string;
  email: string;
  mobile?: string;
  class?: string;
  country?: string;
  isPaid?: boolean;
  examType?: string;
  isOnlineExam?: boolean;
}

interface SidebarProps {
  userData: UserData;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userData, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Book size={20} /> },
    // Add Material option - only show if user has paid
    ...(userData.isPaid ? [{ name: "Material", path: "/material", icon: <BookOpen size={20} /> }] : []),
    // Other navigation items
    { name: "Terms & Conditions", path: "/terms-and-conditions", icon: <FileText size={20} /> },
    { name: "Contact Us", path: "/contact-us", icon: <Phone size={20} /> },
    { name: "Privacy Policy", path: "/privacy-policy", icon: <Shield size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Function to get exam mode display
  const getExamModeDisplay = () => {
    if (!userData.isPaid) {
      return null; // Don't show mode if user hasn't paid
    }

    console.log("userData.isOnlineExam:", userData.isOnlineExam);
    const isOnline = userData.isOnlineExam === true;
    console.log("isOnline:", isOnline);
    console.log("userData.isPaid:", userData.isPaid);

    return (
      <div className="flex items-center text-sm">
        {isOnline ? (
          <>
            <Wifi size={16} className="mr-2 text-green-400" />
            <span className="text-green-400">Mode: Online</span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="mr-2 text-orange-400" />
            <span className="text-orange-400">Mode: Offline</span>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 bg-blue-950 p-2 text-white hover:bg-blue-900 md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-blue-950 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Company Logo and Name */}
        <div className="border-b border-blue-900 p-4">
          <div className="flex items-center">
            <img
              src="/logo.jpg"
              alt="Twilight Finland Logo"
              className="h-10 w-12 rounded-md"
            />
            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">Twilight Finland</h1>
              <p className="text-xs text-gray-300">Student Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-b border-blue-900 p-4">
          <div className="flex items-center">
            <Avatar
              img=""
              alt="User Avatar"
              size="md"
              className="mr-3"
              placeholderInitials={userData.fullname
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white">
                {userData.fullname}
              </h3>
              <p className="text-xs text-gray-300">{userData.email}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="mt-3 space-y-1 text-xs text-gray-300">
            {userData.mobile && (
              <div className="flex items-center">
                <Phone size={12} className="mr-2" />
                <span>{userData.mobile}</span>
              </div>
            )}
            {userData.class && (
              <div className="flex items-center">
                <span className="mr-2">🎓</span>
                <span>Grade: {userData.class}</span>
              </div>
            )}
            {userData.country && (
              <div className="flex items-center">
                <span className="mr-2">🌍</span>
                <span>{userData.country}</span>
              </div>
            )}
            {userData.examType && (
              <div className="flex items-center">
                <span className="mr-2">📝</span>
                <span>{userData.examType}</span>
              </div>
            )}
            {userData.isPaid && (
              <div className="flex items-center">
                <span className="mr-2">💳</span>
                <span className="text-green-400">Status: Paid</span>
              </div>
            )}
            {getExamModeDisplay()}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${isActive(item.path) ? "bg-blue-900 text-white" : "text-gray-300 hover:bg-blue-900 hover:text-white"}`}
                  onClick={closeSidebar}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <Button
                onClick={() => {
                  onLogout();
                  closeSidebar();
                }}
                className="mt-4 flex w-full items-center justify-start bg-transparent px-4 py-2 text-sm font-medium text-gray-300 hover:bg-blue-900 hover:text-white"
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </Button>
            </li>
          </ul>
        </nav>

        {/* Version Info */}
        <div className="absolute bottom-0 w-full border-t border-blue-900 p-4">
          <p className="text-xs text-gray-400">Version 1.0.0</p>
        </div>
      </div>

      {/* Main Content Wrapper - Add this to Dashboard.tsx */}
      <div className="md:ml-64">
        {/* This is where your main content will go */}
        {/* <div className="p-4 pt-20 md:pt-4">Main content here</div> */}
      </div>
    </>
  );
};

export default Sidebar;
