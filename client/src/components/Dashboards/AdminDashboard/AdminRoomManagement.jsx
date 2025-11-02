import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:3000/api';

const AdminRoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedHostel, setSelectedHostel] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [roomStats, setRoomStats] = useState({});
    const [newRooms, setNewRooms] = useState([{ roomNumber: '', floor: '', roomType: '', price: '', capacity: '' }]);
    const [filters, setFilters] = useState({
        status: '',
        roomType: '',
        floor: ''
    });

    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        if (user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            return;
        }
        fetchHostels();
    }, [user.role]);

    useEffect(() => {
        if (selectedHostel) {
            fetchRooms();
            fetchRoomStats();
        }
    }, [selectedHostel, filters]);

    const fetchHostels = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hostels`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setHostels(data.hostels || []);
                if (data.hostels && data.hostels.length > 0) {
                    setSelectedHostel(data.hostels[0]._id);
                }
            } else {
                throw new Error(data.message || 'Failed to fetch hostels');
            }
        } catch (error) {
            console.error('Error fetching hostels:', error);
            toast.error('Failed to load hostels');
        }
    };

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.roomType) params.append('roomType', filters.roomType);
            if (filters.floor) params.append('floor', filters.floor);

            const response = await fetch(`${API_BASE_URL}/rooms/hostel/${selectedHostel}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRooms(data.rooms || []);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Failed to load rooms');
        }
        setLoading(false);
    };

    const fetchRoomStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/utilization/${selectedHostel}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRoomStats(data.utilization || {});
            }
        } catch (error) {
            console.error('Error fetching room stats:', error);
        }
    };

    const createRooms = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    hostelId: selectedHostel,
                    rooms: newRooms
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`${data.rooms.length} rooms created successfully`);
                setShowCreateModal(false);
                setNewRooms([{ roomNumber: '', floor: '', roomType: '', price: '', capacity: '' }]);
                fetchRooms();
                fetchRoomStats();
            } else {
                toast.error(data.message || 'Failed to create rooms');
            }
        } catch (error) {
            console.error('Error creating rooms:', error);
            toast.error('Failed to create rooms');
        }
        setLoading(false);
    };

    const updateRoomStatus = async (roomId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Room status updated to ${status}`);
                fetchRooms();
                fetchRoomStats();
            } else {
                toast.error(data.message || 'Failed to update room status');
            }
        } catch (error) {
            console.error('Error updating room status:', error);
            toast.error('Failed to update room status');
        }
    };

    const deactivateRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to deactivate this room?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/deactivate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Room deactivated successfully');
                fetchRooms();
                fetchRoomStats();
            } else {
                toast.error(data.message || 'Failed to deactivate room');
            }
        } catch (error) {
            console.error('Error deactivating room:', error);
            toast.error('Failed to deactivate room');
        }
    };

    const reactivateRoom = async (roomId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/reactivate`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Room reactivated successfully');
                fetchRooms();
                fetchRoomStats();
            } else {
                toast.error(data.message || 'Failed to reactivate room');
            }
        } catch (error) {
            console.error('Error reactivating room:', error);
            toast.error('Failed to reactivate room');
        }
    };

    const addRoomField = () => {
        setNewRooms([...newRooms, { roomNumber: '', floor: '', roomType: '', price: '', capacity: '' }]);
    };

    const removeRoomField = (index) => {
        if (newRooms.length > 1) {
            const updatedRooms = newRooms.filter((_, i) => i !== index);
            setNewRooms(updatedRooms);
        }
    };

    const updateNewRoomField = (index, field, value) => {
        const updatedRooms = [...newRooms];
        updatedRooms[index][field] = value;
        setNewRooms(updatedRooms);
    };

    const getStatusColor = (status) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            occupied: 'bg-red-100 text-red-800',
            reserved: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            cleaning: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600">Admin privileges required to access this page.</p>
                </div>
            </div>
        );
    }

    const currentHostel = hostels.find(h => h._id === selectedHostel);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                    <p className="text-gray-600">Manage rooms across all hostels</p>
                </div>

                {/* Hostel Selection */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Hostel
                            </label>
                            <select
                                value={selectedHostel}
                                onChange={(e) => setSelectedHostel(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                {hostels.map(hostel => (
                                    <option key={hostel._id} value={hostel._id}>
                                        {hostel.name} - {hostel.location}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {currentHostel && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    Total Rooms: <span className="font-semibold">{currentHostel.totalRooms || 0}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Available: <span className="font-semibold text-green-600">{currentHostel.availableRooms || 0}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Occupied: <span className="font-semibold text-red-600">{currentHostel.occupiedRooms || 0}</span>
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Create Rooms
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="reserved">Reserved</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="cleaning">Cleaning</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Type
                            </label>
                            <select
                                value={filters.roomType}
                                onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                                <option value="shared">Shared</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Floor
                            </label>
                            <input
                                type="number"
                                value={filters.floor}
                                onChange={(e) => setFilters({...filters, floor: e.target.value})}
                                placeholder="Filter by floor"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Room Statistics */}
                {Object.keys(roomStats).length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Room Utilization</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {roomStats.map((stat, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 capitalize">{stat.roomType} Rooms</h4>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <p>Total: {stat.totalRooms}</p>
                                        <p>Available: <span className="text-green-600">{stat.availableRooms}</span></p>
                                        <p>Occupied: <span className="text-red-600">{stat.totalOccupied}</span></p>
                                        <p>Utilization: {stat.utilizationRate}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rooms Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Rooms {currentHostel && `- ${currentHostel.name}`}
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Floor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Capacity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Occupancy
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rooms.map((room) => (
                                        <tr key={room._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {room.roomNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {room.floor}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                {room.roomType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(room.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {room.capacity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {room.currentOccupancy}/{room.capacity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                                                    {room.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <select
                                                    value={room.status}
                                                    onChange={(e) => updateRoomStatus(room._id, e.target.value)}
                                                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="available">Available</option>
                                                    <option value="occupied">Occupied</option>
                                                    <option value="reserved">Reserved</option>
                                                    <option value="maintenance">Maintenance</option>
                                                    <option value="cleaning">Cleaning</option>
                                                </select>
                                                
                                                {room.isActive ? (
                                                    <button
                                                        onClick={() => deactivateRoom(room._id)}
                                                        className="text-red-600 hover:text-red-900 text-sm"
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => reactivateRoom(room._id)}
                                                        className="text-green-600 hover:text-green-900 text-sm"
                                                    >
                                                        Reactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {rooms.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No rooms found for the selected filters.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Rooms Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <h3 className="text-xl font-semibold text-gray-900">Create Multiple Rooms</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={createRooms} className="mt-4">
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {newRooms.map((room, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium">Room {index + 1}</h4>
                                                {newRooms.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRoomField(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Room Number *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={room.roomNumber}
                                                        onChange={(e) => updateNewRoomField(index, 'roomNumber', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Floor *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={room.floor}
                                                        onChange={(e) => updateNewRoomField(index, 'floor', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Room Type *</label>
                                                    <select
                                                        required
                                                        value={room.roomType}
                                                        onChange={(e) => updateNewRoomField(index, 'roomType', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="single">Single</option>
                                                        <option value="double">Double</option>
                                                        <option value="triple">Triple</option>
                                                        <option value="shared">Shared</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Price (UGX) *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={room.price}
                                                        onChange={(e) => updateNewRoomField(index, 'price', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={room.capacity}
                                                        onChange={(e) => updateNewRoomField(index, 'capacity', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        type="button"
                                        onClick={addRoomField}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                    >
                                        Add Another Room
                                    </button>
                                    
                                    <div className="space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Creating...' : 'Create Rooms'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};
// 
export default AdminRoomManagement;

