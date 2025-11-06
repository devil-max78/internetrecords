import React from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex-shrink-0">
              <img
                src="/assets/logo.svg"
                alt="Internet Records"
                className="h-32 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="hover:text-indigo-200 transition">
                Dashboard
              </Link>
              <Link to="/upload" className="hover:text-indigo-200 transition">
                Upload
              </Link>
              <Link to="/youtube-claim" className="hover:text-indigo-200 transition">
                YouTube Claim
              </Link>
              <Link to="/youtube-oac" className="hover:text-indigo-200 transition">
                YouTube OAC
              </Link>
              <Link to="/social-media-linking" className="hover:text-indigo-200 transition">
                Social Media
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-indigo-200 transition">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline text-sm">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="bg-white text-indigo-600 px-4 py-1 rounded-md hover:bg-indigo-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;