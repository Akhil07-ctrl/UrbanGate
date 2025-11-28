import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card, Button, Loading, EmptyState, Badge, Modal, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    month: '',
    amount: '',
    description: '',
    dueDate: '',
    breakdown: {
      maintenance: '',
      water: '',
      electricity: '',
      parking: '',
      other: ''
    },
    createForAll: false
  });

  useEffect(() => {
    // Only residents and admins can see payments
    if (user?.role === 'resident' || user?.role === 'admin') {
      fetchPayments();
    }
  }, [filter, user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments', {
        params: { status: filter || undefined },
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view payments', {
          position: 'top-right',
          autoClose: 3000
        });
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Only residents and admins can view payments.', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error('Failed to fetch payments', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show payments page to security
  if (user?.role === 'security') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text">Maintenance Payments</h1>
        <Card>
          <EmptyState
            title="Access Restricted"
            description="Security personnel cannot view payments. Only residents can access payment information."
            icon="🔒"
          />
        </Card>
      </div>
    );
  }

  const handlePayment = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}/mark-paid`, {
        transactionId: `TXN${Date.now()}`,
        paymentMethod: 'online',
      });
      fetchPayments();
    } catch (error) {
      console.error('Failed to mark payment', error);
    }
  };

  const downloadInvoice = async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/invoice`);
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `invoice-${paymentId}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Failed to download invoice', error);
      toast.error('Failed to download invoice', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const breakdown = {};
      if (formData.breakdown.maintenance) breakdown.maintenance = parseFloat(formData.breakdown.maintenance);
      if (formData.breakdown.water) breakdown.water = parseFloat(formData.breakdown.water);
      if (formData.breakdown.electricity) breakdown.electricity = parseFloat(formData.breakdown.electricity);
      if (formData.breakdown.parking) breakdown.parking = parseFloat(formData.breakdown.parking);
      if (formData.breakdown.other) breakdown.other = parseFloat(formData.breakdown.other);

      const response = await api.post('/payments', {
        month: formData.month,
        amount: parseFloat(formData.amount),
        description: formData.description,
        dueDate: formData.dueDate,
        breakdown: Object.keys(breakdown).length > 0 ? breakdown : undefined,
        createForAll: formData.createForAll
      });

      toast.success(
        formData.createForAll
          ? `Payments created for ${response.data.count} residents`
          : 'Payment created successfully',
        {
          position: 'top-right',
          autoClose: 3000
        }
      );

      setShowCreateModal(false);
      setFormData({
        month: '',
        amount: '',
        description: '',
        dueDate: '',
        breakdown: {
          maintenance: '',
          water: '',
          electricity: '',
          parking: '',
          other: ''
        },
        createForAll: false
      });
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payment', {
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
        <h1 className="text-3xl font-bold text-text">Maintenance Payments</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateModal(true)}>+ Create Payment</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'pending', 'paid', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status ? 'bg-text text-primary' : 'bg-secondary text-text hover:bg-tertiary'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Payment Summary */}
      {payments.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-100 to-gray-50">
          <h2 className="text-lg font-semibold text-text mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-textLight">Total Due</p>
              <p className="text-2xl font-bold text-text">
                ₹{payments.filter((p) => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0)}
              </p>
            </div>
            <div>
              <p className="text-textLight">Total Paid</p>
              <p className="text-2xl font-bold text-success">
                ₹{payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)}
              </p>
            </div>
            <div>
              <p className="text-textLight">Pending</p>
              <p className="text-2xl font-bold text-warning">
                {payments.filter((p) => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payments List */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment._id}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text text-lg">
                      {new Date(payment.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-textLight text-sm">{payment.description}</p>
                    {user?.role === 'admin' && payment.residentId && (
                      <p className="text-xs text-textLight mt-1">
                        Resident: {payment.residentId.name} ({payment.residentId.email})
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'error' : 'warning'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-textLight">Amount</p>
                    <p className="text-xl font-bold text-text">₹{payment.amount}</p>
                  </div>
                  <div>
                    <p className="text-textLight">Due Date</p>
                    <p className="font-semibold text-text">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {payment.breakdown && Object.keys(payment.breakdown).length > 0 && (
                  <div className="bg-secondary p-3 rounded-lg text-sm">
                    <p className="font-semibold text-text mb-2">Breakdown</p>
                    {Object.entries(payment.breakdown).map(
                      ([key, value]) =>
                        value && (
                          <div key={key} className="flex justify-between text-textLight">
                            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <span>₹{value}</span>
                          </div>
                        )
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {payment.status !== 'paid' && user?.role === 'resident' && (
                    <Button onClick={() => handlePayment(payment._id)} className="flex-1">
                      Pay Now
                    </Button>
                  )}
                  <Button onClick={() => downloadInvoice(payment._id)} variant="secondary" className="flex-1">
                    Download Invoice
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Payments" description="You are all caught up!" icon="✓" />
      )}

      {/* Create Payment Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showCreateModal}
          title="Create Maintenance Payment"
          onClose={() => setShowCreateModal(false)}
        >
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="createForAll"
                checked={formData.createForAll}
                onChange={(e) => setFormData({ ...formData, createForAll: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="createForAll" className="text-sm text-text">
                Create for all residents in community
              </label>
            </div>

            <Input
              label="Month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            />

            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Payment description..."
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="2"
              />
            </div>

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-text mb-3">Breakdown (Optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Maintenance"
                  type="number"
                  step="0.01"
                  value={formData.breakdown.maintenance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakdown: { ...formData.breakdown, maintenance: e.target.value }
                    })
                  }
                />
                <Input
                  label="Water"
                  type="number"
                  step="0.01"
                  value={formData.breakdown.water}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakdown: { ...formData.breakdown, water: e.target.value }
                    })
                  }
                />
                <Input
                  label="Electricity"
                  type="number"
                  step="0.01"
                  value={formData.breakdown.electricity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakdown: { ...formData.breakdown, electricity: e.target.value }
                    })
                  }
                />
                <Input
                  label="Parking"
                  type="number"
                  step="0.01"
                  value={formData.breakdown.parking}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakdown: { ...formData.breakdown, parking: e.target.value }
                    })
                  }
                />
                <Input
                  label="Other"
                  type="number"
                  step="0.01"
                  value={formData.breakdown.other}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakdown: { ...formData.breakdown, other: e.target.value }
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {formData.createForAll ? 'Create for All Residents' : 'Create Payment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
