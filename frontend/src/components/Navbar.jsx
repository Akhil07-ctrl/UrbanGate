import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './UI';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications } = useSocket();

  // Navigation items with proper routes
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Benefits', href: '/benefits' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? "/welcome" : "/"} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-text">UrbanGate</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {!user && navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === item.href
                    ? 'text-blue-600 font-semibold'
                    : 'text-text hover:text-blue-600'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/announcements" className="relative px-3 py-2 rounded-lg text-text hover:bg-gray-100 transition-colors">
                  🔔 Notifications
                  {notifications && notifications.length > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-text hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 pb-6 space-y-3 animate-in slide-in-from-top duration-300">
            {!user ? (
              <>
                <div className="px-4 py-4 space-y-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.href
                          ? 'bg-blue-600 text-white font-semibold shadow-md'
                          : 'text-text hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 px-4 space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-lg font-medium text-[#333333] bg-[#f5f5f5] hover:bg-[#e8e8e8] border border-[#d9d9d9] transition-all duration-200 hover:shadow-md"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-lg font-medium text-white bg-[#333333] hover:bg-[#1f1f1f] transition-all duration-200 hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-4 space-y-2">
                  <Link
                    to="/announcements"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-text hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 relative"
                  >
                    🔔 Notifications
                    {notifications && notifications.length > 0 && (
                      <span className="absolute top-2 right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 pt-4 px-4 space-y-3">
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-lg font-medium text-[#333333] bg-[#f5f5f5] hover:bg-[#e8e8e8] border border-[#d9d9d9] transition-all duration-200 hover:shadow-md"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-center rounded-lg font-medium text-white bg-[#ef4444] hover:bg-[#dc2626] transition-all duration-200 hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
