import { useState, useEffect } from 'react';

import { Card, Loading, EmptyState, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [complaints, announcements, visitors, membersRes] = await Promise.all([
          api.get('/complaints?limit=5'),
          api.get('/announcements?limit=5'),
          user?.role === 'resident' ? api.get('/visitors') : Promise.resolve({ data: { visitors: [] } }),
          api.get('/communities/members').catch(() => ({ data: { members: [] } })),
        ]);

        setStats({
          totalComplaints: complaints.data.pagination?.total || 0,
          recentComplaints: complaints.data.complaints || [],
          announcements: announcements.data.announcements || [],
          visitors: visitors.data.visitors || [],
        });
        setMembers(membersRes.data.members || []);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-primary rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-300">{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} • {user?.communityName || 'No community joined yet'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-text mb-2">{stats?.totalComplaints}</div>
            <p className="text-textLight">Total Complaints</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-text mb-2">{stats?.announcements.length}</div>
            <p className="text-textLight">New Announcements</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-text mb-2">{stats?.visitors.length}</div>
            <p className="text-textLight">Visitor Passes</p>
          </div>
        </Card>
      </div>

      {/* Community Members */}
      {members.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Community Members ({members.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (
              <div key={member._id} className="p-3 border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text truncate">{member.name}</p>
                    <p className="text-xs text-textLight truncate">{member.flatNumber || 'N/A'}</p>
                  </div>
                </div>
                <Badge variant={member.role === 'admin' ? 'primary' : member.role === 'security' ? 'warning' : 'success'}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Recent Complaints</h2>
          {stats?.recentComplaints.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentComplaints.map((complaint) => (
                <li key={complaint._id} className="pb-3 border-b border-border last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{complaint.title}</h3>
                      <p className="text-sm text-textLight">{complaint.category}</p>
                    </div>
                    <span className="px-2 py-1 bg-tertiary text-text text-xs rounded-full">{complaint.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No Complaints" description="You have no recent complaints" icon="✓" />
          )}
        </Card>

        {/* Latest Announcements */}
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Latest Announcements</h2>
          {stats?.announcements.length > 0 ? (
            <ul className="space-y-3">
              {stats.announcements.map((announcement) => (
                <li key={announcement._id} className="pb-3 border-b border-border last:border-b-0">
                  <div>
                    <h3 className="font-semibold text-text">{announcement.title}</h3>
                    <p className="text-sm text-textLight truncate">{announcement.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No Announcements" description="Check back later for updates" icon="📢" />
          )}
        </Card>
      </div>
    </div>
  );
};
