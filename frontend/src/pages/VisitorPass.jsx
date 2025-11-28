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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text">Visitor Passes</h1>
        <Card>
          <EmptyState
            title="Admin View"
            description="Admins can view all visitor passes in their community. Residents can create passes and security can scan QR codes."
            icon="👤"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Visitor Passes</h1>
        <div className="flex gap-2">
          {user?.role === 'security' && (
            <Button onClick={() => setShowScanModal(true)} variant="primary">
              Scan QR Code
            </Button>
          )}
          {user?.role === 'resident' && (
            <Button onClick={() => setShowForm(true)}>+ Create Pass</Button>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} title="Create Visitor Pass" onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Guest Name"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            required
            placeholder="Visitor's full name"
          />

          <Input
            label="Guest Phone"
            name="guestPhone"
            type="tel"
            value={formData.guestPhone}
            onChange={handleChange}
            placeholder="Contact number"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">Purpose</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg bg-primary focus:outline-none focus:ring-2 focus:ring-text"
            >
              <option value="visit">Visit</option>
              <option value="delivery">Delivery</option>
              <option value="service">Service</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Valid From"
            name="validFrom"
            type="datetime-local"
            value={formData.validFrom}
            onChange={handleChange}
            required
          />

          <Input
            label="Valid Until"
            name="validUntil"
            type="datetime-local"
            value={formData.validUntil}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full">
            Create Pass
          </Button>
        </form>
      </Modal>

      {/* Passes List */}
      {passes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {passes.map((pass) => (
            <Card key={pass._id}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-text">{pass.guestName}</h3>
                  <p className="text-textLight text-sm">{pass.purpose}</p>
                </div>

                <div className="text-center">
                  <div id={`qr-${pass._id}`}>
                    <QRCode value={pass.qrCode} size={200} level="H" includeMargin={true} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-textLight">Status</p>
                    <Badge
                      variant={
                        pass.status === 'checked-out' ? 'error' :
                        pass.status === 'checked-in' ? 'success' : 'warning'
                      }
                    >
                      {pass.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-textLight">Valid From</p>
                    <p className="font-semibold text-text">{new Date(pass.validFrom).toLocaleDateString()}</p>
                  </div>
                  {pass.entryTime && (
                    <div>
                      <p className="text-textLight">Entry Time</p>
                      <p className="font-semibold text-text">{new Date(pass.entryTime).toLocaleString()}</p>
                    </div>
                  )}
                  {pass.exitTime && (
                    <div>
                      <p className="text-textLight">Exit Time</p>
                      <p className="font-semibold text-text">{new Date(pass.exitTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {user?.role === 'resident' && (
                    <>
                      <Button onClick={() => downloadQR(pass)} className="flex-1" variant="secondary">
                        Download QR
                      </Button>
                      <Button
                        onClick={() => handleDeletePass(pass._id)}
                        className="flex-1"
                        variant="danger"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {user?.role === 'security' && (
                    <Button onClick={() => downloadQR(pass)} className="w-full" variant="secondary">
                      View QR
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Visitor Passes"
          description={user?.role === 'resident' ? 'Create a pass for your visitor' : 'No visitor passes available'}
          icon="👤"
        />
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
        >
          <div className="space-y-4">
            <Input
              label="QR Code"
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              placeholder="Enter or scan QR code"
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleScanQR('check-in')}
                className="flex-1"
                variant="success"
              >
                Check In
              </Button>
              <Button
                onClick={() => handleScanQR('check-out')}
                className="flex-1"
                variant="primary"
              >
                Check Out
              </Button>
            </div>

            <Button
              onClick={() => {
                setShowScanModal(false);
                setQrCodeInput('');
              }}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
