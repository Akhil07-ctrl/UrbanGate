import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Input, Modal, Loading, EmptyState, Badge } from '../components/UI';
import QRCode from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const VisitorPass = () => {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    purpose: 'visit',
    validFrom: '',
    validUntil: '',
  });

  React.useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/visitors');
      setPasses(response.data.visitors || []);
    } catch (error) {
      console.error('Failed to fetch passes', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view visitor passes', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/visitors/create-pass', formData);
      toast.success('Visitor pass created successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      setFormData({ guestName: '', guestPhone: '', purpose: 'visit', validFrom: '', validUntil: '' });
      setShowForm(false);
      fetchPasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create pass', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleScanQR = async (action) => {
    try {
      if (!qrCodeInput.trim()) {
        toast.error('Please enter QR code', {
          position: 'top-right',
          autoClose: 3000
        });
        return;
      }

      await api.post('/visitors/scan-qr', {
        qrCode: qrCodeInput.trim(),
        action
      });
      toast.success(`Visitor ${action}ed successfully`, {
        position: 'top-right',
        autoClose: 3000
      });
      setQrCodeInput('');
      setShowScanModal(false);
      fetchPasses();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} visitor`, {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleDeletePass = async (passId) => {
    if (!window.confirm('Are you sure you want to delete this visitor pass?')) return;

    try {
      await api.delete(`/visitors/${passId}`);
      toast.success('Visitor pass deleted successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      fetchPasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete pass', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const downloadQR = (pass) => {
    const qrElement = document.getElementById(`qr-${pass._id}`);
    if (qrElement) {
      const image = qrElement.querySelector('canvas').toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `visitor-pass-${pass.guestName}.png`;
      link.click();
    }
  };

  if (loading) return <Loading />;

  // Show access message for admin
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visitor Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all visitor passes in your community
            </p>
          </div>
        </div>
        <Card className="p-6">
          <EmptyState
            title="Admin Dashboard"
            description="As an admin, you can monitor all visitor activities. Residents can create passes, and security can manage check-ins/check-outs."
            icon="👥"
            action={{
              text: 'View All Passes',
              onClick: () => fetchPasses()
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitor Passes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'resident' 
              ? 'Create and manage your visitor passes' 
              : 'Scan and manage visitor check-ins'}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {user?.role === 'security' && (
            <button
              onClick={() => setShowScanModal(true)}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M8 8a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Scan QR Code
            </button>
          )}
          {user?.role === 'resident' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Pass
            </button>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal 
        isOpen={showForm} 
        title="Create Visitor Pass" 
        onClose={() => setShowForm(false)}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Input
                label="Guest Name"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                required
                placeholder="Visitor's full name"
                icon="👤"
              />
            </div>

            <div>
              <Input
                label="Guest Phone"
                name="guestPhone"
                type="tel"
                value={formData.guestPhone}
                onChange={handleChange}
                placeholder="Contact number"
                icon="📱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <div className="relative">
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                >
                  <option value="visit">👥 Visit</option>
                  <option value="delivery">📦 Delivery</option>
                  <option value="service">🔧 Service</option>
                  <option value="other">❓ Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <Input
                label="Valid From"
                name="validFrom"
                type="datetime-local"
                value={formData.validFrom}
                onChange={handleChange}
                required
                icon="⏱️"
              />
            </div>

            <div>
              <Input
                label="Valid Until"
                name="validUntil"
                type="datetime-local"
                value={formData.validUntil}
                onChange={handleChange}
                required
                icon="🕒"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Generate Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* Passes List */}
      {passes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map((pass) => {
            const statusVariant = pass.status === 'checked-out' 
              ? 'error' 
              : pass.status === 'checked-in' 
                ? 'success' 
                : 'warning';
                
            const statusIcon = pass.status === 'checked-out'
              ? '🚪'
              : pass.status === 'checked-in'
                ? '✅'
                : '⏳';
                
            return (
              <Card key={pass._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="space-y-5 p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{pass.guestName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                          {pass.purpose.charAt(0).toUpperCase() + pass.purpose.slice(1)}
                        </span>
                        <Badge variant={statusVariant} className="flex items-center gap-1">
                          {statusIcon} {pass.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Valid Until</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(pass.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex justify-center">
                    <div id={`qr-${pass._id}`} className="p-2 bg-white rounded">
                      <QRCode 
                        value={pass.qrCode} 
                        size={180} 
                        level="H" 
                        includeMargin={true} 
                        fgColor="#1F2937" 
                        imageSettings={{
                          src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzRGMzY1MSIgZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyTTEyLDRBOCw4IDAgMCwxIDIwLDEyQTgsOCAwIDAsMSAxMiwyMEE4LDggMCAwLDEgNCwxMkE4LDggMCAwLDEgMTIsNFoiLz48L3N2Zz4=',
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Valid From</p>
                        <p className="font-medium text-gray-900">
                          {new Date(pass.validFrom).toLocaleString()}
                        </p>
                      </div>
                      {pass.entryTime && (
                        <div>
                          <p className="text-xs text-gray-500">Entry Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(pass.entryTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {pass.exitTime && (
                        <div>
                          <p className="text-xs text-gray-500">Exit Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(pass.exitTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {pass.guestPhone && (
                        <div>
                          <p className="text-xs text-gray-500">Contact</p>
                          <p className="font-medium text-gray-900">{pass.guestPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {user?.role === 'resident' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => downloadQR(pass)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          Download QR
                        </button>
                        <button
                          onClick={() => handleDeletePass(pass._id)}
                          className="w-full px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => downloadQR(pass)}
                        className="w-full mt-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        View QR Code
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            title="No Visitor Passes Found"
            description={
              user?.role === 'resident' 
                ? 'You haven\'t created any visitor passes yet. Create your first pass to invite visitors.'
                : 'No visitor passes are currently available. When residents create passes, they will appear here.'
            }
            icon="👤"
            action={
              user?.role === 'resident' 
                ? {
                    text: 'Create Your First Pass',
                    onClick: () => setShowForm(true)
                  }
                : null
            }
          />
        </div>
      )}

      {/* Scan QR Modal (Security) */}
      {user?.role === 'security' && (
        <Modal
          isOpen={showScanModal}
          title="Scan Visitor QR Code"
          onClose={() => {
            setShowScanModal(false);
            setQrCodeInput('');
          }}
          className="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="qrCodeInput" className="block text-sm font-medium text-gray-700 mb-1">
                Enter QR Code
              </label>
              <input
                id="qrCodeInput"
                type="text"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Scan or enter QR code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleScanQR('check-in')}
                disabled={!qrCodeInput.trim()}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Check In
              </button>
              <button
                type="button"
                onClick={() => handleScanQR('check-out')}
                disabled={!qrCodeInput.trim()}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Check Out
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setQrCodeInput('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
