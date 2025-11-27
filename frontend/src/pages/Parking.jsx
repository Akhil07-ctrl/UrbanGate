import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Loading, EmptyState, Badge } from '../components/UI';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const Parking = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [mySlot, setMySlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, mySlotRes] = await Promise.all([
        api.get('/parking'),
        user?.role === 'resident' ? api.get('/parking/resident/my-slot') : Promise.resolve(null),
      ]);

      setSlots(slotsRes.data.parkingSlots || []);
      if (mySlotRes) {
        setMySlot(mySlotRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch parking data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parking/request-guest', {
        slotId: selectedSlot._id,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
      });
      setShowRequestForm(false);
      setFormData({ fromDate: '', toDate: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to request parking', error);
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
      <h1 className="text-3xl font-bold text-text">Parking Management</h1>

      {/* My Slot */}
      {mySlot && user?.role === 'resident' && (
        <Card className="bg-gradient-to-r from-gray-100 to-gray-50">
          <h2 className="text-xl font-bold text-text mb-4">🚗 Your Parking Slot</h2>
          <div className="space-y-2">
            <p>
              <span className="text-textLight">Slot Number:</span> <span className="font-semibold text-text">{mySlot.slotNumber}</span>
            </p>
            <p>
              <span className="text-textLight">Block:</span> <span className="font-semibold text-text">{mySlot.block || 'N/A'}</span>
            </p>
            <p>
              <span className="text-textLight">Floor:</span> <span className="font-semibold text-text">{mySlot.floor || 'N/A'}</span>
            </p>
            <p>
              <span className="text-textLight">Status:</span>{' '}
              <Badge variant={mySlot.isAvailable ? 'success' : 'error'}>
                {mySlot.isAvailable ? 'Available' : 'Occupied'}
              </Badge>
            </p>
          </div>
        </Card>
      )}

      {/* Guest Parking */}
      {user?.role === 'resident' && (
        <div>
          <h2 className="text-xl font-bold text-text mb-4">Guest Parking Requests</h2>
          <div className="grid grid-cols-1 gap-4">
            {slots.filter((slot) => slot.type === 'guest').map((slot) => (
              <Card key={slot._id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-text">Slot {slot.slotNumber}</h3>
                    <p className="text-textLight text-sm">
                      {slot.guestRequests.filter((r) => r.status === 'pending').length} pending requests
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setShowRequestForm(true);
                    }}
                    size="sm"
                  >
                    Request
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Slots */}
      <div>
        <h2 className="text-xl font-bold text-text mb-4">All Parking Slots</h2>
        {slots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <Card key={slot._id}>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-text">Slot {slot.slotNumber}</h3>
                    <p className="text-sm text-textLight">
                      {slot.block} • Floor {slot.floor}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant={slot.type === 'resident' ? 'primary' : 'warning'}>
                      {slot.type}
                    </Badge>
                    <Badge variant={slot.isAvailable ? 'success' : 'error'}>
                      {slot.isAvailable ? 'Available' : 'Occupied'}
                    </Badge>
                  </div>

                  {slot.residentId && (
                    <p className="text-xs text-textLight">
                      Assigned to: {slot.residentId.name} (Apt {slot.residentId.apartment})
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No Parking Slots" description="No parking data available" icon="🅿️" />
        )}
      </div>

      {/* Request Form Modal */}
      <Modal
        isOpen={showRequestForm}
        title="Request Guest Parking"
        onClose={() => {
          setShowRequestForm(false);
          setSelectedSlot(null);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-textLight mb-4">Slot: {selectedSlot?.slotNumber}</p>

          <Input
            label="From Date"
            name="fromDate"
            type="datetime-local"
            value={formData.fromDate}
            onChange={handleChange}
            required
          />

          <Input
            label="To Date"
            name="toDate"
            type="datetime-local"
            value={formData.toDate}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </Modal>
    </div>
  );
};
