import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Service } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, DollarSign, Tag, User } from 'lucide-react';

interface BookingFormProps {
  onClose: () => void;
}

export function BookingForm({ onClose }: BookingFormProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [stylistName, setStylistName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedService || !stylistName || !date || !time) {
        throw new Error('Please fill in all fields');
      }

      const dateTime = new Date(`${date}T${time}`);

      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          user_id: user?.id,
          service_id: selectedService,
          stylist_name: stylistName,
          date_time: dateTime.toISOString(),
          status: 'pending',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            Book Your Appointment
          </h2>
          <p className="text-gray-600 mb-8">Select a service and choose your preferred time</p>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center">
              <p className="font-medium">Appointment booked successfully!</p>
              <p className="text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                  required
                >
                  <option value="">Choose a service...</option>
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <optgroup key={category} label={category}>
                      {categoryServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price} ({service.duration} min)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {selectedServiceData && (
                <div className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-lg border border-rose-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-rose-600" />
                      <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="text-sm font-medium text-gray-900">{selectedServiceData.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-rose-600" />
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{selectedServiceData.duration} min</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-rose-600" />
                      <div>
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="text-sm font-medium text-gray-900">${selectedServiceData.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="stylistName" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Stylist Name</span>
                  </div>
                </label>
                <input
                  id="stylistName"
                  type="text"
                  value={stylistName}
                  onChange={(e) => setStylistName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                  placeholder="Enter stylist name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date</span>
                    </div>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Time</span>
                    </div>
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:from-rose-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
