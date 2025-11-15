import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [filters, setFilters] = useState({
        status: '',
        hostelId: '',
        roomType: ''
    });

    const hostels = JSON.parse(localStorage.getItem('hostels')) || [];
    const admin = JSON.parse(localStorage.getItem('admin')) || {};

    const roomTypes = [
        { value: 'single', label: 'Single Room' },
        { value: 'double', label: 'Double Sharing' },
        { value: 'triple', label: 'Triple Sharing' },
        { value: 'dormitory', label: 'Dormitory' }
    ];

    useEffect(() => {
        fetchStats();
        fetchPendingBookings();
    }, []);

    useEffect(() => {
        if (activeTab === 'all') {
            fetchAllBookings();
        } else if (activeTab === 'pending') {
            fetchPendingBookings();
        }
    }, [activeTab, filters]);

    const fetchStats = async () => {
        try {
            const response = await fetch('https://hostel-management-and-booking-systems.onrender.com/api/bookings/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.hostelId) queryParams.append('hostelId', filters.hostelId);
            if (filters.roomType) queryParams.append('roomType', filters.roomType);

            const response = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/bookings?${queryParams}`);
            const data = await response.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        }
        setLoading(false);
    };

    const fetchPendingBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://hostel-management-and-booking-systems.onrender.com/api/bookings/pending');
            const data = await response.json();
            if (data.success) {
                setPendingBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            toast.error('Failed to load pending bookings');
        }
        setLoading(false);
    };

    const handleApprove = async (bookingId) => {
        try {
            const response = await fetch('https://hostel-management-and-booking-systems.onrender.com/api/bookings/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking approved successfully!');
                fetchPendingBookings();
                fetchStats();
            } else {
                toast.error(data.message || 'Failed to approve booking');
            }
        } catch (error) {
            toast.error('Error approving booking: ' + error.message);
        }
    };

    const handleReject = async (bookingId) => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            const response = await fetch('https://hostel-management-and-booking-systems.onrender.com/api/bookings/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    bookingId, 
                    rejectionReason 
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking rejected successfully!');
                setRejectionReason('');
                fetchPendingBookings();
                fetchStats();
            } else {
                toast.error(data.message || 'Failed to reject booking');
            }
        } catch (error) {
            toast.error('Error rejecting booking: ' + error.message);
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedBookings.length === 0) {
            toast.error('Please select bookings and an action');
            return;
        }

        if (bulkAction === 'reject' && !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason for bulk rejection');
            return;
        }

        try {
            const response = await fetch('https://hostel-management-and-booking-systems.onrender.com/api/bookings/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingIds: selectedBookings,
                    action: bulkAction,
                    rejectionReason: bulkAction === 'reject' ? rejectionReason : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`${data.modifiedCount} bookings ${bulkAction}ed successfully!`);
                setSelectedBookings([]);
                setBulkAction('');
                setRejectionReason('');
                fetchPendingBookings();
                fetchStats();
            } else {
                toast.error(data.message || 'Failed to process bulk action');
            }
        } catch (error) {
            toast.error('Error processing bulk action: ' + error.message);
        }
    };

    const toggleBookingSelection = (bookingId) => {
        setSelectedBookings(prev =>
            prev.includes(bookingId)
                ? prev.filter(id => id !== bookingId)
                : [...prev, bookingId]
        );
    };

    const selectAllBookings = () => {
        const currentBookings = activeTab === 'pending' ? pendingBookings : bookings;
        if (selectedBookings.length === currentBookings.length) {
            setSelectedBookings([]);
        } else {
            setSelectedBookings(currentBookings.map(b => b._id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'checked-in': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const currentBookings = activeTab === 'pending' ? pendingBookings : bookings;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
                    <p className="text-gray-600">Manage and approve hostel bookings</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                        <div className="text-gray-600">Total Bookings</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
                        <div className="text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
                        <div className="text-gray-600">Approved</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
                        <div className="text-gray-600">Rejected</div>
                    </div>
                </div>

                {/* Tabs and Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Tabs */}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-md font-medium ${
                                    activeTab === 'pending'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Pending ({stats.pending || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-md font-medium ${
                                    activeTab === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                All Bookings
                            </button>
                        </div>

                        {/* Filters (for all bookings tab) */}
                        {activeTab === 'all' && (
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="confirmed">Confirmed</option>
                                </select>
                                <select
                                    value={filters.hostelId}
                                    onChange={(e) => setFilters(prev => ({ ...prev, hostelId: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Hostels</option>
                                    {hostels.map(hostel => (
                                        <option key={hostel._id} value={hostel._id}>
                                            {hostel.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filters.roomType}
                                    onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Room Types</option>
                                    {roomTypes.map(room => (
                                        <option key={room.value} value={room.value}>
                                            {room.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Bulk Actions (for pending tab) */}
                    {activeTab === 'pending' && selectedBookings.length > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div>
                                    <span className="font-medium text-yellow-800">
                                        {selectedBookings.length} booking(s) selected
                                    </span>
                                </div>
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Action</option>
                                    <option value="approve">Approve Selected</option>
                                    <option value="reject">Reject Selected</option>
                                </select>
                                {bulkAction === 'reject' && (
                                    <input
                                        type="text"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Rejection reason"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                                <button
                                    onClick={handleBulkAction}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Apply Action
                                </button>
                                <button
                                    onClick={() => setSelectedBookings([])}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bookings List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading bookings...</p>
                        </div>
                    ) : currentBookings.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 text-lg">No bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {activeTab === 'pending' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBookings.length === currentBookings.length && currentBookings.length > 0}
                                                    onChange={selectAllBookings}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hostel
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        {activeTab === 'pending' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50">
                                            {activeTab === 'pending' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBookings.includes(booking._id)}
                                                        onChange={() => toggleBookingSelection(booking._id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {booking.student?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.student?.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.student?.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking.hostel?.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.hostel?.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {booking.roomType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {booking.duration} months
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ₦{booking.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </td>
                                            {activeTab === 'pending' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(booking._id)}
                                                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectionReason('');
                                                                const reason = prompt('Enter rejection reason:');
                                                                if (reason) {
                                                                    setRejectionReason(reason);
                                                                    setTimeout(() => handleReject(booking._id), 100);
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default AdminBookings;