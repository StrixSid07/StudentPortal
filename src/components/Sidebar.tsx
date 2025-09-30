import React, { useState } from "react";
import { Avatar, Button } from "flowbite-react";
import { Menu, X, Book, LogOut, FileText, Phone, Shield, Wifi, WifiOff } from "lucide-react";
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
    // New navigation items
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
    
    const isOnline = userData.isOnlineExam;
    // Add console log for debugging
    console.log('Debug - userData.isOnlineExam:', userData.isOnlineExam);
    console.log('Debug - isOnline:', isOnline);
    console.log('Debug - userData.isPaid:', userData.isPaid);
    
    return {
      text: isOnline ? "Online" : "Offline",
      icon: isOnline ? <Wifi size={16} /> : <WifiOff size={16} />,
      color: isOnline ? "text-green-400" : "text-orange-400"
    };
  };

  const examMode = getExamModeDisplay();

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between bg-blue-950 px-4 md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-white hover:bg-blue-900"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-30 bg-black md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:top-0 top-16 left-0 z-30 h-full w-64 transform bg-blue-950 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >

        {/* User Profile Section */}
        <div className="border-b border-blue-900 p-4">
          <div className="flex items-center">
           <Avatar
                img={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData.fullname,
                )}&background=0D8ABC&color=fff`}
                alt="User avatar"
                size="md"
              />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {userData.fullname}
              </p>
              <p className="text-xs text-gray-300">{userData.email}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-gray-300">
            {userData.mobile && (
              <p className="flex items-center">
                <span className="mr-2">📱</span>
                {userData.mobile}
              </p>
            )}
            {userData.class && (
              <p className="flex items-center">
                <span className="mr-2">🎓</span>
                Grade: {userData.class}
              </p>
            )}
            {userData.country && (
              <p className="flex items-center">
                <span className="mr-2">🌍</span>
                {userData.country}
              </p>
            )}
            <p className="flex items-center">
              <span className="mr-2">💰</span>
              Status: {userData.isPaid ? "Paid" : "Unpaid"}
            </p>
            {/* Online/Offline Mode Status - Only show if user has paid */}
            {examMode && (
              <p className={`flex items-center ${examMode.color}`}>
                <span className="mr-2">{examMode.icon}</span>
                Mode: {examMode.text}
              </p>
            )}
            {userData.examType && (
              <p className="flex items-center">
                <span className="mr-2">📝</span>
                Exam: {userData.examType}
              </p>
            )}
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
