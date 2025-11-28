import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from './UI';

export const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-text text-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="text-primary hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white p-1 rounded-md"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="text-xl font-bold truncate">
              UrbanGate
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Link to="/notifications" className="text-primary relative p-2">
                <span className="text-lg">🔔</span>
                {notifications.length > 0 && (
                  <Badge variant="error" className="absolute -top-1 -right-1 text-xs min-w-[18px] h-5 flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </Badge>
                )}
              </Link>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium truncate max-w-[80px] text-primary">
                    {user.name}
                  </div>
                  <Badge variant={user.role === 'admin' ? 'error' : 'primary'} className="text-xs font-semibold">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="text-xs px-2 py-1">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold">
              UrbanGate
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Link to="/notifications" className="text-primary relative">
                🔔
                {notifications.length > 0 && (
                  <Badge variant="error" className="absolute -top-2 -right-2 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Link>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-primary font-medium">
                  {user.name} <Badge variant={user.role === 'admin' ? 'error' : 'primary'} className="font-semibold">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </span>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export const Sidebar = () => {
  const { user } = useAuth();

  const residentLinks = [
    { label: 'Dashboard', href: '/' },
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
    { label: 'Dashboard', href: '/' },
    { label: 'Community Management', href: '/community-management' },
    { label: 'Complaints', href: '/complaints' },
    { label: 'Announcements', href: '/announcements' },
    { label: 'Parking', href: '/parking' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Payments', href: '/payments' },
    { label: 'Polls', href: '/polls' },
  ];

  const securityLinks = [
    { label: 'Dashboard', href: '/' },
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
                className="block px-4 py-2 rounded-lg text-text hover:bg-tertiary transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text"></div>
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
    <div className="min-h-screen bg-secondary">
      <Header onMenuToggle={handleMenuToggle} />

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
            <div className="w-full max-w-sm bg-secondary border-r border-border">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-textLight hover:text-text"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
};
