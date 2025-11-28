import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Modal, Input, Loading, EmptyState, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const Facilities = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
  });
  const [facilityFormData, setFacilityFormData] = useState({
    name: '',
    description: '',
    type: 'clubhouse',
    capacity: '',
    image: '',
    workingHours: {
      open: '09:00',
      close: '22:00'
    }
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/facilities');
      setFacilities(response.data.facilities || []);
    } catch (error) {
      console.error('Failed to fetch facilities', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view facilities', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error('Failed to fetch facilities', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/facilities/${selectedFacility._id}/book`, formData);
      toast.success('Booking request submitted. Waiting for admin confirmation.', {
        position: 'top-right',
        autoClose: 3000
      });
      setShowBookForm(false);
      setFormData({ startTime: '', endTime: '' });
      fetchFacilities();
      setSelectedFacility(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book facility', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      await api.post('/facilities', {
        ...facilityFormData,
        capacity: parseInt(facilityFormData.capacity) || undefined
      });
      toast.success('Facility created successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      setShowCreateModal(false);
      setFacilityFormData({
        name: '',
        description: '',
        type: 'clubhouse',
        capacity: '',
        image: '',
        workingHours: {
          open: '09:00',
          close: '22:00'
        }
      });
      fetchFacilities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create facility', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleConfirmBooking = async (facilityId, bookingId) => {
    try {
      await api.post('/facilities/confirm-booking', { facilityId, bookingId });
      toast.success('Booking confirmed', {
        position: 'top-right',
        autoClose: 3000
      });
      fetchFacilities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleCancelBooking = async (facilityId, bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.post('/facilities/cancel-booking', { facilityId, bookingId });
      toast.success('Booking cancelled', {
        position: 'top-right',
        autoClose: 3000
      });
      fetchFacilities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking', {
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

  // Get resident's bookings
  const residentBookings = facilities
    .flatMap((facility) =>
      facility.bookings
        ?.filter((b) => {
          const bookingUserId = b.residentId?._id || b.residentId;
          return bookingUserId && bookingUserId.toString() === user?.userId?.toString();
        })
        .map((booking) => ({ ...booking, facilityName: facility.name })) || []
    )
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Facilities</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Book and manage community facilities for your needs
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
            Add Facility
          </Button>
        )}
      </div>

      {/* Resident's Bookings */}
      {user?.role === 'resident' && residentBookings.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              My Upcoming Bookings
            </h2>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {residentBookings.length} total
            </span>
          </div>
          
          <div className="space-y-3">
            {residentBookings.slice(0, 3).map((booking) => (
              <div key={booking._id} className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{booking.facilityName}</p>
                    <div className="flex items-center gap-2 text-sm text-indigo-100 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                {booking.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-indigo-100 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Waiting for admin approval
                    </p>
                  </div>
                )}
              </div>
            ))}
            {residentBookings.length > 3 && (
              <button className="w-full text-center text-indigo-100 hover:text-white text-sm font-medium mt-2">
                + {residentBookings.length - 3} more bookings
              </button>
            )}
          </div>
        </div>
      )}

      {/* Facilities Grid */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Facilities</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {facilities.length} facilities • Book your preferred time slot
            </p>
          </div>
          <div className="relative">
            <select 
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onChange={(e) => {
                // Add filter logic here
              }}
            >
              <option value="all">All Facilities</option>
              <option value="clubhouse">Clubhouse</option>
              <option value="gym">Gym</option>
              <option value="pool">Swimming Pool</option>
              <option value="tennis-court">Tennis Court</option>
              <option value="guest-room">Guest Room</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {facilities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div 
                key={facility._id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {facility.image ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={facility.image} 
                      alt={facility.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Facility+Image';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{facility.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {facility.type.charAt(0).toUpperCase() + facility.type.slice(1).replace('-', ' ')}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {facility.capacity || 'N/A'} people
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {facility.description || 'No description available'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{facility.workingHours?.open} - {facility.workingHours?.close}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{facility.bookings?.filter(b => b.status === 'confirmed').length || 0} confirmed</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {user?.role === 'resident' ? (
                        <button
                          onClick={() => {
                            setSelectedFacility(facility);
                            setShowBookForm(true);
                          }}
                          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </button>
                      ) : user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedFacility(facility);
                            setShowBookingsModal(true);
                          }}
                          className="flex-1 py-2 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Manage
                        </button>
                      )}
                      
                      {facility.bookings?.filter(b => b.status === 'pending').length > 0 && (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center">
                          {facility.bookings.filter(b => b.status === 'pending').length} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No Facilities Available"
            description={
              user?.role === 'admin' 
                ? 'Add facilities to allow residents to book them' 
                : 'No facilities are currently available for booking. Please check back later.'
            }
            icon="🏛️"
            action={
              user?.role === 'admin' 
                ? {
                    text: 'Add Your First Facility',
                    onClick: () => setShowCreateModal(true)
                  } 
                : null
            }
          />
        )}
      </div>

      {/* Book Form Modal (Resident) */}
      {user?.role === 'resident' && (
        <Modal
          isOpen={showBookForm}
          title={`Book ${selectedFacility?.name}`}
          onClose={() => {
            setShowBookForm(false);
            setSelectedFacility(null);
            setFormData({ startTime: '', endTime: '' });
          }}
        >
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-textLight">
                <strong>Working Hours:</strong> {selectedFacility?.workingHours?.open} - {selectedFacility?.workingHours?.close}
              </p>
              {selectedFacility?.capacity && (
                <p className="text-sm text-textLight mt-1">
                  <strong>Capacity:</strong> {selectedFacility.capacity} people
                </p>
              )}
            </div>

            <Input
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              required
            />

            <Input
              label="End Time"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleChange}
              required
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowBookForm(false);
                  setSelectedFacility(null);
                  setFormData({ startTime: '', endTime: '' });
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Request Booking
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Facility Modal (Admin) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showCreateModal}
          title="Add New Facility"
          onClose={() => {
            setShowCreateModal(false);
            setFacilityFormData({
              name: '',
              description: '',
              type: 'clubhouse',
              capacity: '',
              image: '',
              workingHours: {
                open: '09:00',
                close: '22:00'
              }
            });
          }}
        >
          <form onSubmit={handleCreateFacility} className="space-y-4">
            <Input
              label="Facility Name"
              value={facilityFormData.name}
              onChange={(e) => setFacilityFormData({ ...facilityFormData, name: e.target.value })}
              required
              placeholder="e.g., Swimming Pool"
            />

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Description</label>
              <textarea
                value={facilityFormData.description}
                onChange={(e) => setFacilityFormData({ ...facilityFormData, description: e.target.value })}
                placeholder="Describe the facility..."
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Type</label>
              <select
                value={facilityFormData.type}
                onChange={(e) => setFacilityFormData({ ...facilityFormData, type: e.target.value })}
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                required
              >
                <option value="clubhouse">Clubhouse</option>
                <option value="gym">Gym</option>
                <option value="guest-room">Guest Room</option>
                <option value="tennis-court">Tennis Court</option>
                <option value="pool">Swimming Pool</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Capacity (Optional)"
              type="number"
              value={facilityFormData.capacity}
              onChange={(e) => setFacilityFormData({ ...facilityFormData, capacity: e.target.value })}
              placeholder="Maximum number of people"
            />

            <Input
              label="Image URL (Optional)"
              type="url"
              value={facilityFormData.image}
              onChange={(e) => setFacilityFormData({ ...facilityFormData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Opening Time"
                type="time"
                value={facilityFormData.workingHours.open}
                onChange={(e) =>
                  setFacilityFormData({
                    ...facilityFormData,
                    workingHours: { ...facilityFormData.workingHours, open: e.target.value }
                  })
                }
                required
              />

              <Input
                label="Closing Time"
                type="time"
                value={facilityFormData.workingHours.close}
                onChange={(e) =>
                  setFacilityFormData({
                    ...facilityFormData,
                    workingHours: { ...facilityFormData.workingHours, close: e.target.value }
                  })
                }
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFacilityFormData({
                    name: '',
                    description: '',
                    type: 'clubhouse',
                    capacity: '',
                    image: '',
                    workingHours: {
                      open: '09:00',
                      close: '22:00'
                    }
                  });
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Facility
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bookings Management Modal (Admin) */}
      {user?.role === 'admin' && selectedFacility && (
        <Modal
          isOpen={showBookingsModal}
          title={`Bookings - ${selectedFacility.name}`}
          onClose={() => {
            setShowBookingsModal(false);
            setSelectedFacility(null);
          }}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedFacility.bookings && selectedFacility.bookings.length > 0 ? (
              selectedFacility.bookings
                .filter((b) => b.status !== 'cancelled')
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .map((booking) => (
                  <Card key={booking._id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-text">
                            {booking.residentId?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-textLight">{booking.residentId?.email}</p>
                        </div>
                        <Badge
                          variant={
                            booking.status === 'confirmed' ? 'success' :
                            booking.status === 'pending' ? 'warning' : 'error'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-textLight">
                        <p>
                          <strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}
                        </p>
                        <p>
                          <strong>End:</strong> {new Date(booking.endTime).toLocaleString()}
                        </p>
                        <p>
                          <strong>Booked:</strong> {new Date(booking.bookedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleConfirmBooking(selectedFacility._id, booking._id)}
                            variant="success"
                            size="sm"
                            className="flex-1"
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => handleCancelBooking(selectedFacility._id, booking._id)}
                            variant="danger"
                            size="sm"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
            ) : (
              <EmptyState
                title="No Bookings"
                description="No bookings for this facility yet"
                icon="📅"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
