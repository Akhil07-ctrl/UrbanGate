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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parking Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Guest Parking</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <div key={slot._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slot {slot.slotNumber}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Guest Parking
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slot.isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {slot.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending Requests</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {slot.guestRequests.filter((r) => r.status === 'pending').length}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSlot(slot);
                          setShowRequestForm(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Slots */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Parking Slots</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {slots.length} total slots • {slots.filter(s => s.isAvailable).length} available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) => {
                  // Add filter logic here
                }}
              >
                <option value="all">All Types</option>
                <option value="resident">Resident</option>
                <option value="guest">Guest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {slots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div 
                key={slot._id} 
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${
                  slot.isAvailable 
                    ? 'border-green-200 dark:border-green-900/50' 
                    : 'border-red-200 dark:border-red-900/50'
                }`}
              >
                {slot.type === 'resident' && !slot.isAvailable && slot.residentId && (
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    Assigned
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {slot.block ? `${slot.block}-` : ''}{slot.slotNumber}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {slot.floor ? `Floor ${slot.floor} • ` : ''}
                        <span className={`inline-flex items-center gap-1 ${
                          slot.type === 'resident' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
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
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                              </svg>
                              Guest
                            </>
                          )}
                        </span>
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slot.isAvailable 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {slot.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                  </div>

                  {slot.residentId && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned to</p>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                          {slot.residentId.name?.charAt(0) || 'R'}
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {slot.residentId.name || 'Resident'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {slot.residentId.flatNumber ? `Flat ${slot.residentId.flatNumber}` : 'Resident'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {user?.role === 'admin' && slot.type === 'resident' && !slot.residentId && (
                      <button
                        onClick={() => {
                          setSelectedSlot(slot);
                          setShowAssignModal(true);
                        }}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                          <path fillRule="evenodd" d="M15 8a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V8z" clipRule="evenodd" />
                        </svg>
                        Assign Resident
                      </button>
                    )}

                    {user?.role === 'admin' && slot.guestRequests && slot.guestRequests.filter(r => r.status === 'pending').length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span>Guest Requests</span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {slot.guestRequests.filter(r => r.status === 'pending').length} Pending
                          </span>
                        </div>
                        <div className="space-y-2">
                          {slot.guestRequests
                            .filter(r => r.status === 'pending')
                            .slice(0, 2)
                            .map((request, idx) => (
                              <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {request.requestedBy?.name || 'Resident'}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {new Date(request.fromDate).toLocaleDateString('short')}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(request.fromDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(request.toDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  <button 
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    onClick={() => {
                                      // Handle view details
                                    }}
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                          ))}
                          {slot.guestRequests.filter(r => r.status === 'pending').length > 2 && (
                            <button className="w-full text-xs text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1">
                              +{slot.guestRequests.filter(r => r.status === 'pending').length - 2} more requests
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
