import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card, Button, Modal, Input, Loading, EmptyState, Badge } from '../components/UI';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const Parking = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [mySlot, setMySlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
  });
  const [slotFormData, setSlotFormData] = useState({
    slotNumber: '',
    type: 'guest',
    block: '',
    floor: '',
    residentId: '',
  });

  useEffect(() => {
    fetchData();
    if (user?.role === 'admin') {
      fetchResidents();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, mySlotRes] = await Promise.all([
        api.get('/parking').catch(() => ({ data: { parkingSlots: [] } })),
        user?.role === 'resident' ? api.get('/parking/resident/my-slot').catch(() => null) : Promise.resolve(null),
      ]);

      setSlots(slotsRes.data.parkingSlots || []);
      if (mySlotRes?.data) {
        setMySlot(mySlotRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch parking data', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view parking slots', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error('Failed to fetch parking data', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await api.get('/communities/members');
      const residentMembers = response.data.members.filter(m => m.role === 'resident');
      setResidents(residentMembers);
    } catch (error) {
      console.error('Failed to fetch residents', error);
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
      toast.success('Guest parking request submitted', {
        position: 'top-right',
        autoClose: 3000
      });
      setShowRequestForm(false);
      setFormData({ fromDate: '', toDate: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request parking', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parking/create', {
        slotNumber: slotFormData.slotNumber,
        type: slotFormData.type,
        block: slotFormData.block || undefined,
        floor: slotFormData.floor || undefined,
        residentId: slotFormData.residentId || undefined,
      });
      toast.success('Parking slot created successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      setShowCreateSlotModal(false);
      setSlotFormData({ slotNumber: '', type: 'guest', block: '', floor: '', residentId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create parking slot', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleAssignSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parking/assign', {
        slotId: selectedSlot._id,
        residentId: slotFormData.residentId,
      });
      toast.success('Parking slot assigned successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      setShowAssignModal(false);
      setSlotFormData({ ...slotFormData, residentId: '' });
      setSelectedSlot(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign parking slot', {
        position: 'top-right',
        autoClose: 3000
      });
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
        <h1 className="text-3xl font-bold text-text">Parking Management</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateSlotModal(true)}>+ Create Slot</Button>
        )}
      </div>

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
                      Assigned to: {slot.residentId.name} ({slot.residentId.email})
                    </p>
                  )}

                  {user?.role === 'admin' && slot.type === 'resident' && !slot.residentId && (
                    <Button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowAssignModal(true);
                      }}
                      size="sm"
                      className="w-full mt-2"
                    >
                      Assign to Resident
                    </Button>
                  )}

                  {user?.role === 'admin' && slot.guestRequests && slot.guestRequests.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-textLight mb-2">
                        Guest Requests: {slot.guestRequests.filter(r => r.status === 'pending').length} pending
                      </p>
                      {slot.guestRequests
                        .filter(r => r.status === 'pending')
                        .map((request, idx) => (
                          <div key={idx} className="text-xs bg-gray-100 p-2 rounded mb-1">
                            <p className="text-textLight">
                              Requested by: {request.requestedBy?.name || 'Unknown'}
                            </p>
                            <p className="text-textLight">
                              {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
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

      {/* Create Slot Modal (Admin) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showCreateSlotModal}
          title="Create Parking Slot"
          onClose={() => {
            setShowCreateSlotModal(false);
            setSlotFormData({ slotNumber: '', type: 'guest', block: '', floor: '', residentId: '' });
          }}
        >
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <Input
              label="Slot Number"
              value={slotFormData.slotNumber}
              onChange={(e) => setSlotFormData({ ...slotFormData, slotNumber: e.target.value })}
              required
              placeholder="e.g., P-001"
            />

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Type</label>
              <select
                value={slotFormData.type}
                onChange={(e) => setSlotFormData({ ...slotFormData, type: e.target.value })}
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                required
              >
                <option value="guest">Guest</option>
                <option value="resident">Resident</option>
              </select>
            </div>

            <Input
              label="Block (Optional)"
              value={slotFormData.block}
              onChange={(e) => setSlotFormData({ ...slotFormData, block: e.target.value })}
              placeholder="e.g., A, B"
            />

            <Input
              label="Floor (Optional)"
              value={slotFormData.floor}
              onChange={(e) => setSlotFormData({ ...slotFormData, floor: e.target.value })}
              placeholder="e.g., Ground, First"
            />

            {slotFormData.type === 'resident' && (
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Assign to Resident (Optional)</label>
                <select
                  value={slotFormData.residentId}
                  onChange={(e) => setSlotFormData({ ...slotFormData, residentId: e.target.value })}
                  className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                >
                  <option value="">Select resident (optional)</option>
                  {residents.map((resident) => (
                    <option key={resident._id} value={resident._id}>
                      {resident.name} ({resident.flatNumber || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowCreateSlotModal(false);
                  setSlotFormData({ slotNumber: '', type: 'guest', block: '', floor: '', residentId: '' });
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Slot
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Slot Modal (Admin) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showAssignModal}
          title="Assign Parking Slot"
          onClose={() => {
            setShowAssignModal(false);
            setSelectedSlot(null);
            setSlotFormData({ ...slotFormData, residentId: '' });
          }}
        >
          <form onSubmit={handleAssignSlot} className="space-y-4">
            <p className="text-textLight mb-4">Slot: {selectedSlot?.slotNumber}</p>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Assign to Resident</label>
              <select
                value={slotFormData.residentId}
                onChange={(e) => setSlotFormData({ ...slotFormData, residentId: e.target.value })}
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                required
              >
                <option value="">Select resident</option>
                {residents.map((resident) => (
                  <option key={resident._id} value={resident._id}>
                    {resident.name} ({resident.flatNumber || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSlot(null);
                  setSlotFormData({ ...slotFormData, residentId: '' });
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Assign Slot
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
