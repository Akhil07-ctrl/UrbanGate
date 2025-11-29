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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parking Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor parking spaces in your community
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            onClick={() => setShowCreateSlotModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Slot
          </Button>
        )}
      </div>

      {/* My Slot */}
      {mySlot && user?.role === 'resident' && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your Parking Slot
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mySlot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {mySlot.isAvailable ? 'Available' : 'Occupied'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-indigo-100">Slot Number</p>
              <p className="text-xl font-bold">{mySlot.slotNumber}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-indigo-100">Block</p>
              <p className="text-xl font-bold">{mySlot.block || 'N/A'}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-indigo-100">Floor</p>
              <p className="text-xl font-bold">{mySlot.floor || 'N/A'}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-indigo-100">Type</p>
              <p className="text-xl font-bold">Resident</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-sm text-indigo-100">Last Updated</p>
            <p className="text-sm">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* Guest Parking */}
      {user?.role === 'resident' && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Guest Parking</h2>
              <p className="text-sm text-gray-500">
                Request guest parking slots for your visitors
              </p>
            </div>
            <Button
              onClick={() => {
                const guestSlot = slots.find(s => s.type === 'guest');
                if (guestSlot) {
                  setSelectedSlot(guestSlot);
                  setShowRequestForm(true);
                }
              }}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Request
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.filter((slot) => slot.type === 'guest').map((slot) => (
              <div key={slot._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Slot {slot.slotNumber}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Guest Parking
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Pending Requests</p>
                          <p className="text-lg font-semibold text-gray-900">
                          {slot.guestRequests.filter((r) => r.status === 'pending').length}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSlot(slot);
                          // Add any additional click handling here
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Parking Slots */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {user?.role === 'admin' ? 'All Parking Slots' : 'Available Slots'}
        </h2>
        
        {slots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <Card key={slot._id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {slot.block ? `${slot.block}-` : ''}{slot.slotNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {slot.floor ? `Floor ${slot.floor} • ` : ''}
                        <span className={`inline-flex items-center gap-1 ${
                          slot.type === 'resident' ? 'text-blue-600' : 'text-purple-600'
                        }`}>
                          {slot.type === 'resident' ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              Resident
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                              </svg>
                              Guest
                            </>
                          )}
                        </span>
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    {slot.residentId && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Assigned to</p>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                            {slot.residentId.name?.charAt(0) || 'R'}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900">
                              {slot.residentId.name || 'Resident'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {slot.residentId.flatNumber ? `Flat ${slot.residentId.flatNumber}` : 'Resident'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {user?.role === 'admin' && slot.guestRequests && slot.guestRequests.filter(r => r.status === 'pending').length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Guest Requests</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {slot.guestRequests.filter(r => r.status === 'pending').length} Pending
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          // Handle view requests
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  )}
                  {slot.guestRequests.filter(r => r.status === 'pending').length > 2 && (
                    <button 
                      className="w-full text-xs text-center text-blue-600 hover:text-blue-800 mt-1"
                      onClick={() => {
                        // Handle view all requests
                      }}
                    >
                      +{slot.guestRequests.filter(r => r.status === 'pending').length - 2} more requests
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No Parking Slots" 
            description="No parking slots have been added yet" 
            icon="🅿️"
            action={
              user?.role === 'admin' ? {
                text: 'Create First Slot',
                onClick: () => setShowCreateSlotModal(true)
              } : null
            }
          />
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Submit Request
            </button>
          </div>
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
              <button
                type="button"
                onClick={() => {
                  setShowCreateSlotModal(false);
                  setSlotFormData({ slotNumber: '', type: 'guest', block: '', floor: '', residentId: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Slot
              </button>
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
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSlot(null);
                  setSlotFormData({ ...slotFormData, residentId: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Assign Slot
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
