'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookingAppointment {
  id: number;
  user: string;
  chargingStation: string;
  appointmentDate: string;
  statusType: string;
  // Keep these for backward compatibility if needed
  chargingStationId?: number;
  userId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  chargingStationName?: string;
  userName?: string;
  userPhone?: string;
}

const AdminPage = () => {
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingAppointment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setAppointments(data);
      } else if (data && Array.isArray(data.appointments)) {
        // If the response is wrapped in an object with appointments property
        setAppointments(data.appointments);
      } else if (data && Array.isArray(data.data)) {
        // If the response is wrapped in an object with data property
        setAppointments(data.data);
      } else {
        // If no appointments found or unexpected format
        console.warn('Unexpected API response format:', data);
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
      setAppointments([]); // Ensure appointments is always an array
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingAppointment/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh appointments after update
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment status');
    }
  };

  const deleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`https://inventoryapiv1-367404119922.asia-southeast1.run.app/ChargingAppointment/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh appointments after deletion
      fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment');
    }
  };

  // Ensure appointments is always an array before filtering
  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(appointment => {
    if (filter === 'all') return true;
    const status = appointment.statusType || appointment.status;
    return status?.toLowerCase() === filter.toLowerCase() || 
           (filter === 'pending' && status === 'Pending');
  }) : [];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Calculate statistics with proper field handling
  const totalAppointments = Array.isArray(appointments) ? appointments.length : 0;
  const pendingCount = Array.isArray(appointments) ? appointments.filter(apt => 
    (apt.statusType || apt.status)?.toLowerCase() === 'pending'
  ).length : 0;
  const confirmedCount = Array.isArray(appointments) ? appointments.filter(apt => 
    (apt.statusType || apt.status)?.toLowerCase() === 'confirmed'
  ).length : 0;
  const completedCount = Array.isArray(appointments) ? appointments.filter(apt => 
    (apt.statusType || apt.status)?.toLowerCase() === 'completed'
  ).length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage charging station appointments</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchAppointments}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Appointments Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Appointments ({filteredAppointments.length})
            </h2>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No appointments found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charging Station
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.chargingStation || appointment.chargingStationName || appointment.chargingStationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.appointmentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.user || appointment.userName || appointment.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (appointment.statusType || appointment.status) === 'confirmed' ? 'bg-green-100 text-green-800' :
                          (appointment.statusType || appointment.status) === 'pending' || (appointment.statusType || appointment.status) === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          (appointment.statusType || appointment.status) === 'completed' ? 'bg-blue-100 text-blue-800' :
                          (appointment.statusType || appointment.status) === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.statusType || appointment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.createdAt ? formatDate(appointment.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <select
                          value={appointment.statusType || appointment.status || ''}
                          onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Total Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{totalAppointments}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">{confirmedCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
            <p className="text-3xl font-bold text-blue-600">{completedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;