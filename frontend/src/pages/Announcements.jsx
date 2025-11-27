import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, EmptyState, Badge } from '../components/UI';
import api from '../utils/api';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-text">Announcements</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'emergency', 'event', 'maintenance', 'notice', 'general'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === category ? 'bg-text text-primary' : 'bg-secondary text-text hover:bg-tertiary'
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
    </div>
  );
};
