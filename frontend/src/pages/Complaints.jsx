import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, Loading, EmptyState, Badge, Modal } from '../components/UI';
import api from '../utils/api';

export const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/complaints', {
        params: { status: filter || undefined },
      });
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', formData);
      setFormData({ title: '', description: '', category: '', priority: 'medium' });
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      console.error('Failed to create complaint', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Complaints</h1>
        <Button onClick={() => setShowForm(true)}>+ New Complaint</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'open', 'in-progress', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status ? 'bg-text text-primary' : 'bg-secondary text-text hover:bg-tertiary'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} title="Create New Complaint" onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Brief title of complaint"
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Cleanliness', value: 'cleanliness' },
              { label: 'Noise', value: 'noise' },
              { label: 'Water', value: 'water' },
              { label: 'Electricity', value: 'electricity' },
              { label: 'Security', value: 'security' },
              { label: 'Other', value: 'other' },
            ]}
            required
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]}
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Detailed description of the complaint"
          />

          <Button type="submit" className="w-full">
            Submit Complaint
          </Button>
        </form>
      </Modal>

      {/* Complaints List */}
      {complaints.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint._id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <button
                onClick={() => setSelectedComplaint(complaint)}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text">{complaint.title}</h3>
                    <p className="text-textLight text-sm">{complaint.description.substring(0, 100)}...</p>
                  </div>
                  <Badge variant={complaint.status === 'resolved' ? 'success' : 'warning'}>
                    {complaint.status}
                  </Badge>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge variant="primary">{complaint.category}</Badge>
                  <Badge variant="primary">Priority: {complaint.priority}</Badge>
                </div>
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Complaints" description="You have no complaints yet" icon="✓" />
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          title={selectedComplaint.title}
          onClose={() => setSelectedComplaint(null)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-textLight">Description</p>
              <p className="text-text">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-textLight">Category</p>
                <p className="text-text font-semibold">{selectedComplaint.category}</p>
              </div>
              <div>
                <p className="text-sm text-textLight">Priority</p>
                <p className="text-text font-semibold">{selectedComplaint.priority}</p>
              </div>
              <div>
                <p className="text-sm text-textLight">Status</p>
                <p className="text-text font-semibold">{selectedComplaint.status}</p>
              </div>
              <div>
                <p className="text-sm text-textLight">Created</p>
                <p className="text-text font-semibold">
                  {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedComplaint.assignedTo && (
              <div>
                <p className="text-sm text-textLight">Assigned To</p>
                <p className="text-text">{selectedComplaint.assignedTo.name}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
