import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card, Button, Input, Loading, EmptyState, Alert, Badge, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';

export const Communities = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const socket = useSocket();
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFlatModal, setShowFlatModal] = useState(false);
  const [flatNumber, setFlatNumber] = useState('');
  const [selectedCommunityForJoin, setSelectedCommunityForJoin] = useState(null);

  useEffect(() => {
    fetchCommunities();
  }, [searchTerm]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('request_approved', (data) => {
      console.log('Request approved:', data);
      addNotification({
        type: 'success',
        title: 'Request Approved',
        message: data.message
      });
    });

    socket.on('request_rejected', (data) => {
      console.log('Request rejected:', data);
      addNotification({
        type: 'error',
        title: 'Request Rejected',
        message: `${data.message}${data.reason ? ': ' + data.reason : ''}`
      });
    });

    socket.on('removed_from_community', (data) => {
      console.log('Removed from community:', data);
      addNotification({
        type: 'error',
        title: 'Removed from Community',
        message: data.message
      });
      fetchCommunities();
    });

    return () => {
      socket.off('request_approved');
      socket.off('request_rejected');
      socket.off('removed_from_community');
    };
  }, [socket, addNotification]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communities/all', {
        params: { search: searchTerm, limit: 20 }
      });
      setCommunities(response.data.communities);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch communities', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = (communityId) => {
    setSelectedCommunityForJoin(communityId);
    setShowFlatModal(true);
  };

  const handleConfirmJoin = async () => {
    if (!flatNumber.trim()) {
      toast.error('Please enter your flat/apartment number', {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }

    try {
      const response = await api.post('/communities/join', {
        communityId: selectedCommunityForJoin,
        flatNumber: flatNumber.trim()
      });
      toast.success('Join request sent successfully! ✓', {
        position: 'top-right',
        autoClose: 2000
      });
      setShowFlatModal(false);
      setFlatNumber('');
      setSelectedCommunityForJoin(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send join request', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-primary rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Manage Your Community</h1>
          <p className="text-gray-300">Create and manage your apartment community</p>
        </div>
        <CreateCommunity onSuccess={() => setMessage('Community created successfully')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-primary rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Join a Community</h1>
        <p className="text-gray-300">Search and join your apartment community</p>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            label="Search Communities"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, location..."
          />
        </div>

        {loading ? (
          <Loading />
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community) => (
              <Card key={community._id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="mb-3">
                  <h3 className="font-bold text-text text-lg">{community.name}</h3>
                  <p className="text-sm text-textLight">📍 {community.location}</p>
                </div>

                <p className="text-sm text-text mb-3 line-clamp-2">{community.description}</p>

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs text-textLight">👥 {community.totalMembers} members</span>
                  <Badge variant="primary">{community.adminId.name}</Badge>
                </div>

                <button
                  onClick={() => handleJoinRequest(community._id)}
                  className="w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Request to Join
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Communities Found"
            description="No communities match your search. Try different keywords."
            icon="🏢"
          />
        )}
      </Card>

      {/* Flat Number Modal */}
      <Modal
        isOpen={showFlatModal}
        title="Enter Your Flat Number"
        onClose={() => {
          setShowFlatModal(false);
          setFlatNumber('');
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Flat/Apartment Number *
            </label>
            <Input
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="e.g., A-101, 202, Block B-45"
              autoFocus
            />
            <p className="text-xs text-textLight mt-1">Enter your flat or apartment number for verification</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowFlatModal(false);
                setFlatNumber('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmJoin}
              className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CreateCommunity = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    facilities: '',
    rules: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(Boolean),
        rules: formData.rules.split('\n').map(r => r.trim()).filter(Boolean)
      };

      const response = await api.post('/communities/create', submitData);
      setSuccess(response.data.message);
      setFormData({ name: '', description: '', location: '', facilities: '', rules: '' });
      onSuccess?.();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text mb-6">Create New Community</h2>

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Community Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Sunrise Apartments"
        />

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe your community..."
            className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#333333]"
            rows="3"
          />
        </div>

        <Input
          label="Location"
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="e.g., Downtown, City Area"
        />

        <Input
          label="Facilities (comma-separated)"
          type="text"
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          placeholder="e.g., Gym, Pool, Parking, Clubhouse"
        />

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">Rules (one per line)</label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            placeholder="Community rules..."
            className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#333333]"
            rows="4"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Community'}
        </Button>
      </form>
    </Card>
  );
};
