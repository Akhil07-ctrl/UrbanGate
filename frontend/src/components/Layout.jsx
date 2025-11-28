import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from './UI';

export const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section - Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 xl:hidden"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link 
              to={user ? "/welcome" : "/"} 
              className="flex-shrink-0 flex items-center ml-4 md:ml-0"
            >
              <span className="text-xl font-bold text-gray-900">UrbanGate</span>
            </Link>
          </div>

          {/* Right section - Desktop navigation */}
          <div className="hidden xl:ml-6 xl:flex xl:items-center xl:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Link to="/notifications" className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Profile dropdown */}
            {user && (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden lg:inline-flex items-center">
                      {user.name}
                      <Badge variant={user.role === 'admin' ? 'error' : 'primary'} className="ml-2">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </span>
                  </button>
                </div>

                {/* Profile dropdown panel */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    ></div>
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center xl:hidden">
            <div className="relative mr-2">
              <Link to="/notifications" className="p-1 rounded-full text-gray-500 hover:text-gray-700">
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>
            
            {user && (
              <div className="ml-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const Sidebar = ({ onLinkClick }) => {
  const { user } = useAuth();

  const residentLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Communities', href: '/communities' },
    { label: 'Complaints', href: '/complaints' },
    { label: 'Announcements', href: '/announcements' },
    { label: 'Visitor Pass', href: '/visitor-pass' },
    { label: 'Parking', href: '/parking' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Payments', href: '/payments' },
    { label: 'Polls', href: '/polls' },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Community Management', href: '/community-management' },
    { label: 'Complaints', href: '/complaints' },
    { label: 'Announcements', href: '/announcements' },
    { label: 'Parking', href: '/parking' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Payments', href: '/payments' },
    { label: 'Polls', href: '/polls' },
  ];

  const securityLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Communities', href: '/communities' },
    { label: 'Announcements', href: '/announcements' },
    { label: 'Visitor Pass', href: '/visitor-pass' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'security' ? securityLinks : residentLinks;

  return (
    <nav className="w-64 bg-secondary border-r border-border min-h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={onLinkClick}
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="flex-1">{link.label}</span>
                <svg className="ml-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export const Layout = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return children;
  }

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={handleMenuToggle} />

      {/* Mobile/Tablet menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
            <div className="w-full max-w-sm bg-white border-r border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar - Only show on xl screens and up */}
        <div className="hidden xl:flex xl:flex-shrink-0">
          <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1">
                <Sidebar />
              </div>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content - Add padding for mobile/tablet when sidebar is hidden */}
        <div className="flex-1 overflow-auto focus:outline-none xl:pl-0 pl-4">
          <main className="flex-1 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
