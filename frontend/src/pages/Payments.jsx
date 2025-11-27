import React, { useState, useEffect } from 'react';
import { Card, Button, Loading, EmptyState, Badge } from '../components/UI';
import api from '../utils/api';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments', {
        params: { status: filter || undefined },
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-text">Maintenance Payments</h1>

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
                  {payment.status !== 'paid' && (
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
    </div>
  );
};
