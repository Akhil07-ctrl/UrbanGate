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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Community Facilities</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateModal(true)}>+ Add Facility</Button>
        )}
      </div>

      {/* Resident's Bookings */}
      {user?.role === 'resident' && residentBookings.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-100 to-gray-50">
          <h2 className="text-xl font-bold text-text mb-4">My Bookings</h2>
          <div className="space-y-3">
            {residentBookings.slice(0, 3).map((booking) => (
              <div key={booking._id} className="p-3 bg-white rounded-lg border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-text">{booking.facilityName}</p>
                    <p className="text-sm text-textLight">
                      {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                    </p>
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
              </div>
            ))}
            {residentBookings.length > 3 && (
              <p className="text-sm text-textLight text-center">
                + {residentBookings.length - 3} more bookings
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Facilities Grid */}
      {facilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((facility) => (
            <Card key={facility._id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {facility.image && (
                  <img src={facility.image} alt={facility.name} className="w-full h-48 object-cover rounded-lg" />
                )}

                <div>
                  <h3 className="text-xl font-bold text-text">{facility.name}</h3>
                  <p className="text-textLight text-sm">{facility.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-textLight">Type</p>
                    <p className="font-semibold text-text">{facility.type}</p>
                  </div>
                  <div>
                    <p className="text-textLight">Capacity</p>
                    <p className="font-semibold text-text">{facility.capacity} people</p>
                  </div>
                  <div>
                    <p className="text-textLight">Opens</p>
                    <p className="font-semibold text-text">{facility.workingHours?.open}</p>
                  </div>
                  <div>
                    <p className="text-textLight">Closes</p>
                    <p className="font-semibold text-text">{facility.workingHours?.close}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-textLight text-sm">
                    {facility.bookings?.filter((b) => b.status === 'confirmed').length || 0} confirmed bookings
                  </p>
                  {facility.bookings?.filter((b) => b.status === 'pending').length > 0 && (
                    <Badge variant="warning">
                      {facility.bookings.filter((b) => b.status === 'pending').length} pending
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {user?.role === 'resident' && (
                    <Button
                      onClick={() => {
                        setSelectedFacility(facility);
                        setShowBookForm(true);
                      }}
                      className="flex-1"
                    >
                      Book Facility
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <Button
                      onClick={() => {
                        setSelectedFacility(facility);
                        setShowBookingsModal(true);
                      }}
                      className="flex-1"
                      variant="secondary"
                    >
                      Manage Bookings
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Facilities"
          description={user?.role === 'admin' ? 'Add facilities to your community' : 'No facilities available for booking'}
          icon="🏛️"
        />
      )}

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
