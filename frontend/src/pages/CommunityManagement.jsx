import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Input, Loading, EmptyState, Alert, Badge, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';

export const CommunityManagement = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const socket = useSocket();
  const [community, setCommunity] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    facilities: '',
    rules: ''
  });

  useEffect(() => {
    fetchCommunityData();
  }, []);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_join_request', (data) => {
      console.log('New join request received:', data);
      addNotification({
        type: 'success',
        title: 'New Join Request',
        message: `${data.userName} requested to join ${data.communityName}`
      });
      fetchCommunityData();
    });

    return () => {
      socket.off('new_join_request');
    };
  }, [socket, addNotification]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/communities/my-community');
      setCommunity(response.data.community);
      await fetchJoinRequests(response.data.community._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch community', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async (communityId) => {
    try {
      const response = await api.get('/communities/admin/join-requests', {
        params: { communityId, status: 'pending' }
      });
      setJoinRequests(response.data.joinRequests);
    } catch (err) {
      console.error('Failed to fetch join requests', err);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const response = await api.post(`/communities/admin/approve-request/${requestId}`);
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 2000
      });
      setJoinRequests(joinRequests.filter(r => r._id !== requestId));
      fetchCommunityData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await api.post(`/communities/admin/reject-request/${requestId}`, {
        rejectionReason
      });
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 2000
      });
      setJoinRequests(joinRequests.filter(r => r._id !== requestId));
      setShowModal(false);
      setRejectionReason('');
      fetchCommunityData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await api.delete(
        `/communities/admin/remove-member/${community._id}/${memberId}`
      );
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 2000
      });
      fetchCommunityData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleCreateCommunity = async () => {
    if (!formData.name || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields', {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }

    try {
      const response = await api.post('/communities/create', {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()) : [],
        rules: formData.rules ? formData.rules.split(',').map(r => r.trim()) : []
      });
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 2000
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        facilities: '',
        rules: ''
      });
      fetchCommunityData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create community', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  if (loading) return <Loading />;

  if (!community) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-primary rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Community Management</h1>
          <p className="text-gray-300">Create your community to get started</p>
        </div>

        <Card>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-text mb-4">No Community Created Yet</h2>
            <p className="text-textLight mb-6">Create a community to manage residents and security guards</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              + Create Community
            </Button>
          </div>
        </Card>

        {/* Create Community Modal */}
        <Modal
          isOpen={showCreateModal}
          title="Create New Community"
          onClose={() => setShowCreateModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Community Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Green Valley Apartments"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your community..."
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Downtown, New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Facilities (comma-separated)
              </label>
              <textarea
                value={formData.facilities}
                onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                placeholder="e.g., Gym, Swimming Pool, Basketball Court"
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Community Rules (comma-separated)
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                placeholder="e.g., No noise after 10 PM, Keep common areas clean"
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="2"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCommunity}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Community
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-primary rounded-lg p-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
          <p className="text-gray-300">📍 {community.location}</p>
        </div>
      </div>

      {/* Community Details */}
      <Card>
        <h2 className="text-2xl font-bold text-text mb-4">Community Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-textLight">Description</p>
            <p className="text-text">{community.description}</p>
          </div>
          <div>
            <p className="text-sm text-textLight">Total Members</p>
            <p className="text-2xl font-bold text-text">{community.totalMembers}</p>
          </div>
        </div>

        {community.facilities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-textLight mb-2">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {community.facilities.map((facility, idx) => (
                <Badge key={idx} variant="success">{facility}</Badge>
              ))}
            </div>
          </div>
        )}

        {community.rules.length > 0 && (
          <div>
            <p className="text-sm text-textLight mb-2">Community Rules</p>
            <ul className="list-disc list-inside space-y-1">
              {community.rules.map((rule, idx) => (
                <li key={idx} className="text-text text-sm">{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Join Requests */}
      <Card>
        <h2 className="text-2xl font-bold text-text mb-4">
          Pending Join Requests ({joinRequests.length})
        </h2>

        {joinRequests.length > 0 ? (
          <div className="space-y-4">
            {joinRequests.map((request) => (
              <div
                key={request._id}
                className="p-4 border border-[#d9d9d9] rounded-lg flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{request.userId.name}</h3>
                  <p className="text-sm text-textLight">{request.userId.email}</p>
                  <div className="flex gap-2 items-center mt-2">
                    <Badge variant="primary">{request.userRole}</Badge>
                    {request.flatNumber && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        🏢 {request.flatNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request._id)}
                    variant="success"
                    size="sm"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request._id);
                      setShowModal(true);
                    }}
                    variant="danger"
                    size="sm"
                  >
                    ✕ Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Pending Requests"
            description="All join requests have been reviewed"
            icon="✓"
          />
        )}
      </Card>

      {/* Members List */}
      <Card>
        <h2 className="text-2xl font-bold text-text mb-4">Community Members</h2>

        {community.members && community.members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d9d9d9]">
                  <th className="text-left p-3 text-text font-semibold">Name</th>
                  <th className="text-left p-3 text-text font-semibold">Email</th>
                  <th className="text-left p-3 text-text font-semibold">Role</th>
                  <th className="text-left p-3 text-text font-semibold">Joined</th>
                  <th className="text-left p-3 text-text font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {community.members
                  .filter(m => m.isActive)
                  .map((member) => (
                    <tr key={member._id} className="border-b border-[#d9d9d9]">
                      <td className="p-3 text-text">{member.userId?.name}</td>
                      <td className="p-3 text-textLight">{member.userId?.email}</td>
                      <td className="p-3">
                        <Badge variant={member.role === 'admin' ? 'primary' : 'success'}>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-textLight">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {member.role !== 'admin' && (
                          <Button
                            onClick={() => handleRemoveMember(member.userId._id)}
                            variant="danger"
                            size="sm"
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Members" description="No members yet" icon="👥" />
        )}
      </Card>

      {/* Rejection Modal */}
      <Modal
        isOpen={showModal}
        title="Reject Join Request"
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Tell the user why their request was rejected..."
              className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
              rows="3"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReject(selectedRequest)}
              variant="danger"
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Community Modal */}
      <Modal
        isOpen={showCreateModal}
        title="Create New Community"
        onClose={() => setShowCreateModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Community Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Green Valley Apartments"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your community..."
              className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Location *
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Downtown, New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Facilities (comma-separated)
            </label>
            <textarea
              value={formData.facilities}
              onChange={(e) => setFormData({...formData, facilities: e.target.value})}
              placeholder="e.g., Gym, Swimming Pool, Basketball Court"
              className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
              rows="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Community Rules (comma-separated)
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              placeholder="e.g., No noise after 10 PM, Keep common areas clean"
              className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
              rows="2"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCommunity}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Community
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
