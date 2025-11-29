import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card, Loading, EmptyState, Badge, Button, Modal, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    isUrgent: false,
    expiresAt: '',
    image: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/announcements', {
        params: { category: filter || undefined },
      });
      
      console.log('Announcements API response:', response.data);
      
      if (response.data && Array.isArray(response.data.announcements)) {
        setAnnouncements(response.data.announcements);
      } else {
        console.error('Unexpected response format:', response.data);
        setAnnouncements([]);
        toast.error('Received unexpected data format from server', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view announcements', {
          position: 'top-right',
          autoClose: 3000
        });
      } else if (error.response?.status === 401) {
        toast.error('Please log in to view announcements', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch announcements', {
          position: 'top-right',
          autoClose: 3000
        });
      }
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields', {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }
    
    try {
      const response = await api.post('/announcements', formData);
      
      if (response.data && response.data.announcement) {
        toast.success('Announcement created successfully', {
          position: 'top-right',
          autoClose: 3000
        });
        
        // Reset form and close modal
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'general',
          isUrgent: false,
          expiresAt: '',
          image: ''
        });
        
        // Refresh the announcements list
        await fetchAnnouncements();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to create announcement. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with the latest community news and updates
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'security') && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: '', name: 'All', icon: '📰' },
          { id: 'emergency', name: 'Emergency', icon: '🚨' },
          { id: 'event', name: 'Events', icon: '🎉' },
          { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
          { id: 'notice', name: 'Notices', icon: '📢' },
          { id: 'general', name: 'General', icon: 'ℹ️' },
        ].map(({ id, name, icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
              filter === id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement) => (
            <div 
              key={announcement._id}
              className={`group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                announcement.isUrgent ? 'ring-2 ring-red-500' : 'border border-gray-200'
              }`}
            >
              {announcement.isUrgent && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  URGENT
                </div>
              )}
              
              {announcement.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={announcement.image} 
                    alt="announcement" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    announcement.category === 'emergency' ? 'bg-red-100 text-red-800' :
                    announcement.category === 'event' ? 'bg-blue-100 text-blue-800' :
                    announcement.category === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    announcement.category === 'notice' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {announcement.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {announcement.content}
                </p>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {announcement.createdBy?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">
                        {announcement.createdBy?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {announcement.createdBy?.role || 'Resident'}
                      </p>
                    </div>
                  </div>
                  
                  {announcement.expiresAt && new Date(announcement.expiresAt) > new Date() && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Announcements" description="No announcements available" icon="📢" />
      )}

      {/* Create Announcement Modal (Admin/Security) */}
      {(user?.role === 'admin' || user?.role === 'security') && (
        <Modal
          isOpen={showCreateModal}
          title="Create Announcement"
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              title: '',
              content: '',
              category: 'general',
              isUrgent: false,
              expiresAt: '',
              image: ''
            });
          }}
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Announcement title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Announcement content..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              >
                <option value="general">General</option>
                <option value="emergency">Emergency</option>
                <option value="event">Event</option>
                <option value="maintenance">Maintenance</option>
                <option value="notice">Notice</option>
              </select>
            </div>

            <Input
              label="Image URL (Optional)"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />

            <Input
              label="Expires At (Optional)"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isUrgent"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isUrgent" className="text-sm text-gray-700">
                Mark as Urgent
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    title: '',
                    content: '',
                    category: 'general',
                    isUrgent: false,
                    expiresAt: '',
                    image: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Announcement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
