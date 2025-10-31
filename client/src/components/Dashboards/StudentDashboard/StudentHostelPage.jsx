import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StudentHostelPage() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        roomType: '',
        minPrice: '',
        maxPrice: '',
        amenities: ''
    });
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        roomType: '',
        checkInDate: '',
        checkOutDate: ''
    });

    // Fetch all hostels with filters
    const getHostels = async (filterParams = {}) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filterParams).toString();
            const res = await fetch(`http://localhost:3000/api/hostel?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            if (data.success) {
                setHostels(data.hostels);
            } else {
                toast.error(data.message || 'Failed to fetch hostels', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Error fetching hostels', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Check hostel availability
    const checkAvailability = async (hostelId, roomType) => {
        try {
            const res = await fetch(`http://localhost:3000/api/hostel/${hostelId}/availability`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomType: roomType,
                    checkInDate: new Date().toISOString().split('T')[0],
                    checkOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }),
            });
            const data = await res.json();

            if (data.success) {
                if (data.available) {
                    toast.success(`${roomType} room is available! Price: $${data.hostel.price}/month`, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                } else {
                    toast.warning(`${roomType} room is not available`, {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }
            }
            return data.available;
        } catch (error) {
            toast.error('Error checking availability', {
                position: "top-right",
                autoClose: 3000,
            });
            return false;
        }
    };

    // Book hostel room
    const bookHostel = async (hostelId, roomData) => {
        try {
            const studentId = JSON.parse(localStorage.getItem('student'))._id;
            const res = await fetch(`http://localhost:3000/api/booking/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    student: studentId,
                    hostel: hostelId,
                    roomType: roomData.roomType,
                    checkInDate: roomData.checkInDate,
                    checkOutDate: roomData.checkOutDate,
                    status: 'pending'
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Booking request submitted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
                setShowBookingModal(false);
                setBookingData({
                    roomType: '',
                    checkInDate: '',
                    checkOutDate: ''
                });
            } else {
                toast.error(data.message || 'Booking failed', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Error submitting booking', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Remove empty filters
        const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== '')
        );

        getHostels(activeFilters);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            search: '',
            location: '',
            roomType: '',
            minPrice: '',
            maxPrice: '',
            amenities: ''
        });
        getHostels();
    };

    // Open booking modal
    const openBookingModal = (hostel, roomType) => {
        setSelectedHostel(hostel);
        setBookingData({
            ...bookingData,
            roomType: roomType
        });
        setShowBookingModal(true);
    };

    useEffect(() => {
        getHostels();
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Hostel</h1>
                    <p className="text-lg text-gray-600">Discover comfortable and affordable accommodation</p>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search hostels..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                placeholder="Enter location..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Room Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                            <select
                                value={filters.roomType}
                                onChange={(e) => handleFilterChange('roomType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="shared">Shared</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    placeholder="Min"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    placeholder="Max"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                            <input
                                type="text"
                                value={filters.amenities}
                                onChange={(e) => handleFilterChange('amenities', e.target.value)}
                                placeholder="WiFi, AC, Laundry..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="w-full px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hostels List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading hostels...</p>
                        </div>
                    ) : hostels.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 text-lg">No hostels found matching your criteria</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Available Hostels ({hostels.length})
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hostels.map((hostel) => (
                                    <div key={hostel._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        {/* Hostel Image */}
                                        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                            {hostel.images && hostel.images.length > 0 && hostel.images[0] ? (
                                                <img
                                                    src={hostel.images[0]}
                                                    alt={hostel.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Hostel Details */}
                                        <div className="p-4">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{hostel.name}</h3>
                                            <p className="text-gray-600 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {hostel.location}
                                            </p>

                                            {/* Contact Info */}
                                            {hostel.contact && (
                                                <p className="text-sm text-gray-600 mb-3">
                                                    📞 {hostel.contact.phone}
                                                </p>
                                            )}

                                            {/* Room Types */}
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Available Rooms:</h4>
                                                {hostel.roomTypes && hostel.roomTypes.map((room, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                        <div>
                                                            <span className="font-medium text-gray-900 capitalize">{room.type}</span>
                                                            <span className="text-sm text-gray-600 ml-2">({room.available} available)</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-green-600">${room.price}</span>
                                                            <span className="text-sm text-gray-600">/month</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Amenities */}
                                            {hostel.amenities && hostel.amenities.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">Amenities:</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {hostel.amenities.slice(0, 3).map((amenity, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                            >
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                        {hostel.amenities.length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                                +{hostel.amenities.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        // For students, this could show more details
                                                        toast.info('Showing hostel details', {
                                                            position: "top-right",
                                                            autoClose: 2000,
                                                        });
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                {hostel.roomTypes && hostel.roomTypes[0] && (
                                                    <button
                                                        onClick={() => openBookingModal(hostel, hostel.roomTypes[0].type)}
                                                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                                    >
                                                        Book Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedHostel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Book {selectedHostel.name}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Type
                                </label>
                                <select
                                    value={bookingData.roomType}
                                    onChange={(e) => setBookingData({ ...bookingData, roomType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Room Type</option>
                                    {selectedHostel.roomTypes && selectedHostel.roomTypes.map((room, index) => (
                                        <option key={index} value={room.type}>
                                            {room.type} - ${room.price}/month
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Check-in Date
                                </label>
                                <input
                                    type="date"
                                    value={bookingData.checkInDate}
                                    onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Check-out Date
                                </label>
                                <input
                                    type="date"
                                    value={bookingData.checkOutDate}
                                    onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => bookHostel(selectedHostel._id, bookingData)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}

export default StudentHostelPage;