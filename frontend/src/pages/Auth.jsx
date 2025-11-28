import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select } from '../components/UI';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful! Welcome back 👋', {
        position: 'top-right',
        autoClose: 2000
      });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">Welcome Back</h1>
            <p className="text-textLight text-lg">Sign in to your UrbanGate account</p>
          </div>

          <Card className="shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-text">Password</label>
                  <a href="#" className="text-sm text-info hover:text-blue-700 transition-colors">
                    Forgot?
                  </a>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-info rounded cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-textLight cursor-pointer">
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-textLight">
                Don't have an account?{' '}
                <Link to="/register" className="text-info font-semibold hover:text-blue-700 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </Card>

          <div className="mt-6 text-center text-sm text-textLight">
            <p>By signing in, you agree to our</p>
            <div className="space-x-2">
              <a href="#" className="text-info hover:underline">Terms</a>
              <span>•</span>
              <a href="#" className="text-info hover:underline">Privacy</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'resident',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully! 🎉', {
        position: 'top-right',
        autoClose: 2000
      });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">Create Account</h1>
            <p className="text-textLight text-lg">Join UrbanGate today</p>
          </div>

          <Card className="shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />

              <Select
                label="Account Type"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'resident', label: 'Resident' },
                  { value: 'security', label: 'Security Guard' },
                  { value: 'admin', label: 'Community Admin' }
                ]}
              />

              <Button
                type="submit"
                className="w-full py-2.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-textLight">
                Already have an account?{' '}
                <Link to="/login" className="text-info font-semibold hover:text-blue-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>

          <div className="mt-6 text-center text-sm text-textLight">
            <p>By registering, you agree to our</p>
            <div className="space-x-2">
              <a href="#" className="text-info hover:underline">Terms</a>
              <span>•</span>
              <a href="#" className="text-info hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
