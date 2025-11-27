import React, { useState } from 'react';
import { Card, Button, Input, Modal, Loading, EmptyState } from '../components/UI';
import QRCode from 'qrcode.react';
import api from '../utils/api';

export const VisitorPass = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/visitors/create-pass', formData);
      setFormData({ guestName: '', guestPhone: '', purpose: 'visit', validFrom: '', validUntil: '' });
      setShowForm(false);
      fetchPasses();
    } catch (error) {
      console.error('Failed to create pass', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Visitor Passes</h1>
        <Button onClick={() => setShowForm(true)}>+ Create Pass</Button>
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
                    <p className="font-semibold text-text">{pass.status}</p>
                  </div>
                  <div>
                    <p className="text-textLight">Valid From</p>
                    <p className="font-semibold text-text">{new Date(pass.validFrom).toLocaleDateString()}</p>
                  </div>
                </div>

                <Button onClick={() => downloadQR(pass)} className="w-full" variant="secondary">
                  Download QR
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Visitor Passes" description="Create a pass for your visitor" icon="👤" />
      )}
    </div>
  );
};
