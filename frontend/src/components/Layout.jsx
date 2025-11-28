import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from './UI';

export const Header = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-text text-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          UrbanGate
        </Link>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Link to="/notifications" className="text-primary relative">
              🔔 Notifications
              {notifications.length > 0 && (
                <Badge variant="error" className="absolute -top-2 -right-2 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {user.name} <Badge variant="primary">{user.role}</Badge>
              </span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          )}
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

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
