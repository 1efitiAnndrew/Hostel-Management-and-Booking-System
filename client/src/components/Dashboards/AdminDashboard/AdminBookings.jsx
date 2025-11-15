import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'https://hostel-management-and-booking-systems.onrender.com/api';

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
    const [hostels, setHostels] = useState([]);
    const [availableRooms, setAvailableRooms] = useState({});
    const [showRoomAssignment, setShowRoomAssignment] = useState(false);
    const [selectedBookingForRoom, setSelectedBookingForRoom] = useState(null);
    const [roomAssignmentLoading, setRoomAssignmentLoading] = useState(false);

    const admin = JSON.parse(localStorage.getItem('admin')) || {};

    const roomTypes = [
        { value: 'single', label: 'Single Room' },
        { value: 'double', label: 'Double Sharing' },
        { value: 'triple', label: 'Triple Sharing' }
    ];

    useEffect(() => {
        fetchHostels();
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

    const fetchHostels = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hostels`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setHostels(data.hostels || []);
            }
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
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

            const response = await fetch(`${API_BASE_URL}/bookings?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
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
            const response = await fetch(`${API_BASE_URL}/bookings/pending`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
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

    const fetchAvailableRooms = async (hostelId, roomType) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/rooms/available-for-booking?hostelId=${hostelId}&roomType=${roomType}`, 
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            const data = await response.json();
            if (data.success) {
                setAvailableRooms(prev => ({
                    ...prev,
                    [hostelId]: {
                        ...prev[hostelId],
                        [roomType]: data.availableRooms || []
                    }
                }));
                return data.availableRooms || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            return [];
        }
    };

    const handleApprove = async (bookingId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking approved successfully!');
                fetchPendingBookings();
                fetchStats();
                fetchAllBookings();
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
            const response = await fetch(`${API_BASE_URL}/bookings/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                fetchAllBookings();
            } else {
                toast.error(data.message || 'Failed to reject booking');
            }
        } catch (error) {
            toast.error('Error rejecting booking: ' + error.message);
        }
    };

    const handleAutoAssignRoom = async (bookingId) => {
        setRoomAssignmentLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/auto-assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Room ${data.booking.roomNumber} assigned successfully!`);
                setShowRoomAssignment(false);
                setSelectedBookingForRoom(null);
                fetchAllBookings();
                fetchPendingBookings();
            } else {
                toast.error(data.message || 'Failed to assign room automatically');
            }
        } catch (error) {
            toast.error('Error assigning room: ' + error.message);
        }
        setRoomAssignmentLoading(false);
    };

    const handleManualAssignRoom = async (bookingId, roomId) => {
        setRoomAssignmentLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/manual-assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    bookingId, 
                    roomId 
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Room ${data.booking.roomNumber} assigned successfully!`);
                setShowRoomAssignment(false);
                setSelectedBookingForRoom(null);
                fetchAllBookings();
                fetchPendingBookings();
            } else {
                toast.error(data.message || 'Failed to assign room');
            }
        } catch (error) {
            toast.error('Error assigning room: ' + error.message);
        }
        setRoomAssignmentLoading(false);
    };

    const handleCheckIn = async (bookingId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/check-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Student checked in successfully!');
                fetchAllBookings();
            } else {
                toast.error(data.message || 'Failed to check in student');
            }
        } catch (error) {
            toast.error('Error checking in student: ' + error.message);
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/check-out`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Student checked out successfully!');
                fetchAllBookings();
            } else {
                toast.error(data.message || 'Failed to check out student');
            }
        } catch (error) {
            toast.error('Error checking out student: ' + error.message);
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
            const response = await fetch(`${API_BASE_URL}/bookings/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                fetchAllBookings();
            } else {
                toast.error(data.message || 'Failed to process bulk action');
            }
        } catch (error) {
            toast.error('Error processing bulk action: ' + error.message);
        }
    };

    const openRoomAssignment = async (booking) => {
        setSelectedBookingForRoom(booking);
        setShowRoomAssignment(true);
        
        // Fetch available rooms for this booking
        if (booking.hostel && booking.roomType) {
            await fetchAvailableRooms(booking.hostel._id, booking.roomType);
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
            case 'checked-out': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
        }).format(amount);
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
                                    <option value="checked-in">Checked In</option>
                                    <option value="checked-out">Checked Out</option>
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
                                            Room
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                {booking.roomType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {booking.roomNumber ? (
                                                    <span className="font-medium text-green-600">
                                                        {booking.roomNumber}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500">Not Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {booking.duration} months
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(booking.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex flex-col space-y-1">
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(booking._id)}
                                                                className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt('Enter rejection reason:');
                                                                    if (reason) {
                                                                        setRejectionReason(reason);
                                                                        setTimeout(() => handleReject(booking._id), 100);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'approved' && !booking.roomNumber && (
                                                        <button
                                                            onClick={() => openRoomAssignment(booking)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                                                        >
                                                            Assign Room
                                                        </button>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleCheckIn(booking._id)}
                                                            className="text-purple-600 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                                                        >
                                                            Check In
                                                        </button>
                                                    )}
                                                    {booking.status === 'checked-in' && (
                                                        <button
                                                            onClick={() => handleCheckOut(booking._id)}
                                                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                                                        >
                                                            Check Out
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Room Assignment Modal */}
                {showRoomAssignment && selectedBookingForRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Assign Room to Booking</h3>
                                    <button
                                        onClick={() => setShowRoomAssignment(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium mb-2">Booking Details</h4>
                                    <p><strong>Student:</strong> {selectedBookingForRoom.student?.name}</p>
                                    <p><strong>Hostel:</strong> {selectedBookingForRoom.hostel?.name}</p>
                                    <p><strong>Room Type:</strong> {selectedBookingForRoom.roomType}</p>
                                    <p><strong>Duration:</strong> {selectedBookingForRoom.duration} months</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Auto Assign */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium mb-2">Auto Assign Room</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Automatically assign the first available room matching the criteria.
                                        </p>
                                        <button
                                            onClick={() => handleAutoAssignRoom(selectedBookingForRoom._id)}
                                            disabled={roomAssignmentLoading}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {roomAssignmentLoading ? 'Assigning...' : 'Auto Assign Room'}
                                        </button>
                                    </div>

                                    {/* Manual Assign */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium mb-2">Manual Room Assignment</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Select a specific room from available rooms.
                                        </p>
                                        {availableRooms[selectedBookingForRoom.hostel?._id]?.[selectedBookingForRoom.roomType]?.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                                {availableRooms[selectedBookingForRoom.hostel._id][selectedBookingForRoom.roomType].map(room => (
                                                    <button
                                                        key={room._id}
                                                        onClick={() => handleManualAssignRoom(selectedBookingForRoom._id, room._id)}
                                                        disabled={roomAssignmentLoading}
                                                        className="p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Room {room.roomNumber}<br/>
                                                        Floor {room.floor}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-red-500 text-sm">No available rooms found for this criteria.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ToastContainer />
        </div>
    );
};

export default AdminBookings;
