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
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Failed to fetch announcements', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view announcements', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error('Failed to fetch announcements', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      toast.success('Announcement created successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        isUrgent: false,
        expiresAt: '',
        image: ''
      });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Announcements</h1>
        {(user?.role === 'admin' || user?.role === 'security') && (
          <Button onClick={() => setShowCreateModal(true)}>+ Create Announcement</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'emergency', 'event', 'maintenance', 'notice', 'general'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === category ? 'bg-text text-primary' : 'bg-secondary text-text hover:bg-tertiary'
              }`}
          >
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement._id}
              className={`${announcement.isUrgent ? 'border-2 border-error' : 'border border-border'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-text">{announcement.title}</h2>
                  <p className="text-textLight text-sm mt-1">
                    By {announcement.createdBy.name} • {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {announcement.isUrgent && <Badge variant="error">URGENT</Badge>}
                  <Badge variant="primary">{announcement.category}</Badge>
                </div>
              </div>

              <p className="text-text mb-4">{announcement.content}</p>

              {announcement.image && (
                <img src={announcement.image} alt="announcement" className="w-full h-auto rounded-lg mb-4" />
              )}
            </Card>
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
              <label className="block text-sm font-medium text-[#333333] mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Announcement content..."
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
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
              <label htmlFor="isUrgent" className="text-sm text-text">
                Mark as Urgent
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
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
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Announcement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
