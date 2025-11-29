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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your maintenance payments and dues
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Payment
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'pending', 'paid', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status ? (
              <span className="flex items-center gap-1">
                {status === 'paid' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {status === 'pending' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {status === 'overdue' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                All Payments
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Payment Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Total Due</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{payments
                    .filter((p) => p.status !== 'paid')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {payments.filter((p) => p.status !== 'paid').length} unpaid payment{payments.filter((p) => p.status !== 'paid').length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{payments
                    .filter((p) => p.status === 'paid')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {payments.filter((p) => p.status === 'paid').length} payment{payments.filter((p) => p.status === 'paid').length !== 1 ? 's' : ''} completed
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Pending & Overdue</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {payments.filter((p) => p.status === 'pending' || p.status === 'overdue').length}
                  </p>
                  <span className="text-xs text-amber-600">
                    ({payments.filter((p) => p.status === 'overdue').length} overdue)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {payments.filter((p) => p.status === 'pending' || p.status === 'overdue').length > 0 ? 'Action required' : 'All clear!'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => {
            const isPaid = payment.status === 'paid';
            const isOverdue = payment.status === 'overdue';
            const isPending = payment.status === 'pending';
            
            return (
              <div 
                key={payment._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  {/* Header with status */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {new Date(payment.month).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h3>
                      {payment.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.description}
                        </p>
                      )}
                      {user?.role === 'admin' && payment.residentId && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {payment.residentId.name}
                        </div>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : isOverdue 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isPaid && (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isOverdue && (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {isPending && (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>

                  {/* Payment details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</p>
                      <p className={`text-lg font-semibold ${
                        isOverdue ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                        {isOverdue && (
                          <span className="ml-2 text-xs font-normal text-red-500">
                            (Overdue)
                          </span>
                        )}
                      </p>
                    </div>
                    {isPaid && payment.paidAt && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paid On</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Breakdown */}
                  {payment.breakdown && Object.keys(payment.breakdown).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</p>
                      <div className="space-y-2">
                        {Object.entries(payment.breakdown).map(
                          ([key, value]) =>
                            value && (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-medium text-gray-900">
                                  ₹{parseFloat(value).toLocaleString('en-IN')}
                                </span>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {!isPaid && user?.role === 'resident' && (
                      <button
                        onClick={() => handlePayment(payment._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pay Now
                      </button>
                    )}
                    <button
                      onClick={() => downloadInvoice(payment._id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isPaid 
                          ? 'bg-white text-indigo-600 hover:bg-gray-50 border border-gray-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isPaid ? 'Download Receipt' : 'Preview Invoice'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No Payments Found" 
          description={filter 
            ? `No ${filter} payments found. Try adjusting your filters.` 
            : 'You are all caught up with your payments!'} 
          icon="💰"
          action={
            filter && { 
              text: 'Clear Filters', 
              onClick: () => setFilter('') 
            }
          }
        />
      )}

      {/* Create Payment Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showCreateModal}
          title="Create Maintenance Payment"
          onClose={() => setShowCreateModal(false)}
          size="lg"
        >
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 -mx-1">
            <form onSubmit={handleCreatePayment} className="space-y-4 p-1">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="E.g., Monthly maintenance for common areas"
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center py-2">
                  <input
                    type="checkbox"
                    id="createForAll"
                    checked={formData.createForAll}
                    onChange={(e) => setFormData({ ...formData, createForAll: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="createForAll" className="ml-2 block text-sm text-gray-700">
                    Create for all residents
                  </label>
                </div>
              </div>

              {/* Breakdown Section - Collapsible */}
              <div className="border-t border-gray-200 pt-3">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="text-sm font-medium text-gray-700">
                      Payment Breakdown (Optional)
                    </span>
                    <svg className="w-4 h-4 text-gray-500 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-gray-500">
                      Break down the total amount into categories
                    </p>
                    {Object.entries(formData.breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <label className="w-24 text-sm text-gray-700 truncate">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newBreakdown = { ...formData.breakdown, [key]: e.target.value };
                              setFormData({ ...formData, breakdown: newBreakdown });
                            }}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="pl-7 pr-3 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-1 px-1 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    {formData.createForAll ? 'Create for All' : 'Create Payment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
