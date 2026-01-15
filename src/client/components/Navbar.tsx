import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/upload', label: 'Upload' },
    { to: '/agreement-request', label: 'Request New Label' },
    { to: '/youtube-claim', label: 'YouTube Claim' },
    { to: '/youtube-oac', label: 'YouTube OAC' },
    { to: '/social-media-linking', label: 'Social Media' },
    { to: '/artist-profile-linking', label: 'Artist Profiles' },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md relative">
      <div className="container mx-auto px-4 py-1">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/assets/logo.svg"
              alt="Internet Records"
              className="h-20 md:h-32 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-indigo-200 transition text-sm"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="hover:text-indigo-200 transition text-sm">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <span className="text-sm">
              {user?.name} ({user?.role})
            </span>
            <Link
              to="/profile"
              className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-400 transition text-sm"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="bg-white text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-100 transition text-sm"
            >
              Logout
            </button>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md hover:bg-indigo-500 transition focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-indigo-700 shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            {/* User Info (Mobile) */}
            <div className="pb-3 mb-3 border-b border-indigo-500">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-indigo-200">{user?.role}</p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="block py-2 px-3 rounded-md hover:bg-indigo-600 transition"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="block py-2 px-3 rounded-md hover:bg-indigo-600 transition"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="mt-4 pt-4 border-t border-indigo-500 space-y-2">
              <Link
                to="/profile"
                onClick={closeMenu}
                className="block w-full text-center bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-400 transition"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="block w-full bg-white text-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;