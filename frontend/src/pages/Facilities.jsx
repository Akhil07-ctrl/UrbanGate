import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Loading, EmptyState, Badge } from '../components/UI';
import api from '../utils/api';

export const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/facilities/${selectedFacility._id}/book`, formData);
      setShowBookForm(false);
      setFormData({ startTime: '', endTime: '' });
      fetchFacilities();
      setSelectedFacility(null);
    } catch (error) {
      console.error('Failed to book facility', error);
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
      <h1 className="text-3xl font-bold text-text">Community Facilities</h1>

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

                <div>
                  <p className="text-textLight text-sm mb-2">
                    {facility.bookings?.filter((b) => b.status === 'confirmed').length || 0} bookings
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setSelectedFacility(facility);
                    setShowBookForm(true);
                  }}
                  className="w-full"
                >
                  Book Facility
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Facilities" description="No facilities available for booking" icon="🏛️" />
      )}

      {/* Book Form Modal */}
      <Modal
        isOpen={showBookForm}
        title={`Book ${selectedFacility?.name}`}
        onClose={() => {
          setShowBookForm(false);
          setSelectedFacility(null);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full">
            Confirm Booking
          </Button>
        </form>
      </Modal>
    </div>
  );
};
