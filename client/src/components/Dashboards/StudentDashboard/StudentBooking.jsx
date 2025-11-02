import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:3000/api';

const StudentBooking = () => {
    const [loading, setLoading] = useState(false);
    const [currentHostel, setCurrentHostel] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [formData, setFormData] = useState({
        student: '',
        hostel: '68f500b910fe35883fe9f1a4',
        roomType: '',
        checkInDate: '',
        checkOutDate: '',
        duration: '',
        amount: '',
        paymentMethod: 'cash',
        paymentProof: '',
        paymentStatus: 'pending',
        bookingType: 'extension'
    });
    const [myBookings, setMyBookings] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [roomAvailability, setRoomAvailability] = useState({});

    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const student = JSON.parse(localStorage.getItem('student')) || {};

    useEffect(() => {
        fetchCurrentHostel();
        const studentId = user.id || student._id;
        if (studentId) {
            setFormData(prev => ({ ...prev, student: studentId }));
            fetchMyBookings(studentId);
        }
    }, [user.id, student._id]);

    // Fetch Olympia Hostel information directly
    const fetchCurrentHostel = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hostels/68f500b910fe35883fe9f1a4`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.hostel) {
                    setCurrentHostel(data.hostel);
                    setFormData(prev => ({ ...prev, hostel: data.hostel._id }));
                    fetchRoomTypes(data.hostel._id);
                    fetchRoomUtilization(data.hostel._id);
                    setServerError(false);
                } else {
                    toast.error('Hostel data not found');
                }
            } else {
                throw new Error('Failed to fetch hostel');
            }
        } catch (error) {
            console.error('Error fetching hostel:', error);
            setServerError(true);
            toast.error('Unable to connect to server. Please try again later.');
        }
    };

    // Fetch room utilization statistics
    const fetchRoomUtilization = async (hostelId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/utilization/${hostelId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.utilization) {
                    const availability = {};
                    data.utilization.forEach(util => {
                        availability[util.roomType] = {
                            available: util.availableRooms,
                            total: util.totalRooms,
                            utilizationRate: util.utilizationRate
                        };
                    });
                    setRoomAvailability(availability);
                }
            }
        } catch (error) {
            console.error('Error fetching room utilization:', error);
        }
    };

    // Fetch available room types for the hostel
    const fetchRoomTypes = async (hostelId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/hostel/${hostelId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.rooms) {
                    // Get unique room types from rooms
                    const uniqueRoomTypes = [...new Set(data.rooms.map(room => room.roomType))];
                    const types = uniqueRoomTypes.map(roomType => {
                        const room = data.rooms.find(r => r.roomType === roomType);
                        return {
                            value: roomType,
                            label: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room`,
                            price: room?.price || 0,
                            capacity: room?.capacity || 1
                        };
                    });
                    setRoomTypes(types);
                }
            }
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    // Check room availability when dates or room type changes
    const checkRoomAvailability = async (hostelId, roomType, checkInDate, checkOutDate) => {
        if (!hostelId || !roomType || !checkInDate || !checkOutDate) return;

        try {
            const params = new URLSearchParams({
                hostelId,
                roomType,
                checkInDate,
                checkOutDate
            });

            const response = await fetch(`${API_BASE_URL}/rooms/available-for-booking?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailableRooms(data.availableRooms || []);
                    return data.availableRooms.length > 0;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking room availability:', error);
            return false;
        }
    };

    const fetchMyBookings = async (studentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/student/${studentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMyBookings(data.bookings || []);
                }
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setMyBookings([]);
        }
    };

    const calculateAmount = (roomType, duration) => {
        const room = roomTypes.find(r => r.value === roomType);
        if (room && duration) {
            return room.price * parseInt(duration);
        }
        return 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const validateForm = () => {
        const { roomType, checkInDate, checkOutDate, duration, paymentProof } = formData;
        
        if (!roomType || !checkInDate || !checkOutDate || !duration) {
            toast.error('Please fill in all required fields');
            return false;
        }

        if (!currentHostel) {
            toast.error('Hostel information not available. Please contact administration.');
            return false;
        }

        // Check room availability
        const selectedRoomType = roomTypes.find(room => room.value === roomType);
        if (selectedRoomType && roomAvailability[roomType] && roomAvailability[roomType].available === 0) {
            toast.error(`No ${selectedRoomType.label} rooms available in ${currentHostel.name}`);
            return false;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            toast.error('Check-in date cannot be in the past');
            return false;
        }

        if (checkOut <= checkIn) {
            toast.error('Check-out date must be after check-in date');
            return false;
        }

        if (parseInt(duration) < 1) {
            toast.error('Duration must be at least 1 month');
            return false;
        }

        if (!paymentProof) {
            toast.error('Please upload payment proof');
            return false;
        }

        return true;
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Recalculate amount when room type or duration changes
        if (name === 'roomType' || name === 'duration') {
            const newRoomType = name === 'roomType' ? value : formData.roomType;
            const newDuration = name === 'duration' ? value : formData.duration;
            const amount = calculateAmount(newRoomType, newDuration);
            setFormData(prev => ({ ...prev, amount: amount.toString() }));
        }

        // Calculate duration when dates change and check availability
        if ((name === 'checkInDate' || name === 'checkOutDate') && formData.checkInDate && formData.checkOutDate) {
            const checkIn = new Date(name === 'checkInDate' ? value : formData.checkInDate);
            const checkOut = new Date(name === 'checkOutDate' ? value : formData.checkOutDate);
            
            if (checkOut > checkIn) {
                const diffTime = Math.abs(checkOut - checkIn);
                const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
                setFormData(prev => ({ 
                    ...prev, 
                    duration: diffMonths.toString(),
                    amount: calculateAmount(formData.roomType, diffMonths.toString()).toString()
                }));

                // Check room availability
                if (currentHostel && formData.roomType) {
                    await checkRoomAvailability(
                        currentHostel._id,
                        formData.roomType,
                        name === 'checkInDate' ? value : formData.checkInDate,
                        name === 'checkOutDate' ? value : formData.checkOutDate
                    );
                }
            }
        }

        // Check availability when room type changes
        if (name === 'roomType' && value && currentHostel && formData.checkInDate && formData.checkOutDate) {
            await checkRoomAvailability(
                currentHostel._id,
                value,
                formData.checkInDate,
                formData.checkOutDate
            );
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Maximum 5MB allowed.');
                e.target.value = '';
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid file type. Please upload images or PDF files only.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    paymentProof: reader.result
                }));
                toast.success('File uploaded successfully');
            };
            reader.onerror = () => {
                toast.error('Error reading file');
                e.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const studentId = user.id || student._id;
        if (!studentId) {
            toast.error('Please log in to make a booking');
            return;
        }

        if (!currentHostel) {
            toast.error('Hostel information not available');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const duration = parseInt(formData.duration) || 0;
            const amount = parseInt(formData.amount) || 0;
            
            if (duration <= 0 || amount <= 0) {
                throw new Error('Invalid duration or amount');
            }

            const bookingData = {
                student: studentId.toString(),
                hostel: currentHostel._id.toString(),
                roomType: formData.roomType.trim(),
                checkInDate: new Date(formData.checkInDate).toISOString(),
                checkOutDate: new Date(formData.checkOutDate).toISOString(),
                duration: duration,
                amount: amount,
                paymentMethod: formData.paymentMethod.trim(),
                paymentProof: formData.paymentProof,
                paymentStatus: 'pending',
                bookingType: 'same-hostel',
                currentStudent: true
            };

            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Booking extension submitted successfully! Waiting for approval.', {
                    position: 'top-right',
                    autoClose: 6000
                });
                
                // Reset form but keep current hostel
                setFormData({
                    student: studentId,
                    hostel: currentHostel._id,
                    roomType: '',
                    checkInDate: '',
                    checkOutDate: '',
                    duration: '',
                    amount: '',
                    paymentMethod: 'cash',
                    paymentProof: '',
                    paymentStatus: 'pending',
                    bookingType: 'extension'
                });
                
                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                
                // Refresh bookings list
                fetchMyBookings(studentId);
            } else {
                const errorMessage = data.message || 'Failed to submit booking extension. Please try again.';
                toast.error(errorMessage, {
                    position: 'top-right',
                    autoClose: 5000
                });
            }
        } catch (error) {
            toast.error(`Error submitting booking: ${error.message}`, {
                position: 'top-right',
                autoClose: 5000
            });
        }
        setLoading(false);
    };

    const studentInfo = student.name || user.name;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Server Status Indicator */}
                {serverError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Connection Issue
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>Unable to connect to server. Please try again later.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Feel at home asyour with us</h1>
                    <p className="text-gray-600">
                        {studentInfo ? `Welcome, ${studentInfo}!` : 'Book your hostel room extension'}
                    </p>
                    
                    {currentHostel && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                            <p className="text-blue-800 font-medium">
                                Current Hostel: <span className="font-bold">{currentHostel.name}</span>
                            </p>
                            <p className="text-blue-600 text-sm">Location: {currentHostel.location}</p>
                            <p className="text-blue-600 text-sm">
                                Available Rooms: {currentHostel.availableRooms || 0} / {currentHostel.totalRooms || 0}
                            </p>
                        </div>
                    )}
                    
                    {student.cms_id && (
                        <p className="text-sm text-gray-500 mt-1">CMS ID: {student.cms_id}</p>
                    )}
                </div>

                {!user.id && !student._id ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <p className="text-yellow-800">Please log in to make a booking</p>
                    </div>
                ) : !currentHostel ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800">Hostel information not available. Please contact administration for assistance.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Booking Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center mb-6">
                                    <div className="bg-green-100 p-2 rounded-lg mr-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">Extend Your Stay at {currentHostel.name}</h2>
                                        <p className="text-gray-600 text-sm">Book additional time in your current hostel</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Current Hostel Display */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Current Hostel
                                        </label>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{currentHostel.name}</p>
                                                <p className="text-gray-600 text-sm">{currentHostel.location}</p>
                                                {currentHostel.contact?.phone && (
                                                    <p className="text-gray-500 text-sm">Contact: {currentHostel.contact.phone}</p>
                                                )}
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Currently Assigned
                                            </span>
                                        </div>
                                    </div>

                                    {/* Room Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Room Type *
                                        </label>
                                        <select
                                            name="roomType"
                                            value={formData.roomType}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select room type</option>
                                            {roomTypes.map(room => (
                                                <option key={room.value} value={room.value}>
                                                    {room.label} - {formatCurrency(room.price)}/month
                                                    {roomAvailability[room.value] && 
                                                        ` (${roomAvailability[room.value].available} available)`
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {formData.roomType && roomAvailability[formData.roomType] && (
                                            <p className={`text-xs mt-1 ${
                                                roomAvailability[formData.roomType].available > 0 
                                                    ? 'text-green-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {roomAvailability[formData.roomType].available > 0 
                                                    ? `${roomAvailability[formData.roomType].available} ${roomAvailability[formData.roomType].available === 1 ? 'room' : 'rooms'} available`
                                                    : 'No rooms available of this type'
                                                }
                                                {roomAvailability[formData.roomType].utilizationRate && 
                                                    ` • ${roomAvailability[formData.roomType].utilizationRate}% utilization`
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Check-in Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="checkInDate"
                                                value={formData.checkInDate}
                                                onChange={handleInputChange}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Check-out Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="checkOutDate"
                                                value={formData.checkOutDate}
                                                onChange={handleInputChange}
                                                required
                                                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Duration and Amount */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration (months) *
                                            </label>
                                            <input
                                                type="number"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                required
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Total Amount
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formatCurrency(formData.amount || 0)}
                                                    readOnly
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold text-gray-900"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <span className="text-gray-500 text-sm">UGX</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method *
                                        </label>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="mobile_money">Mobile Money</option>
                                            <option value="online">Online Payment</option>
                                        </select>
                                    </div>

                                    {/* Payment Proof */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Proof (Receipt/Transaction Screenshot) *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileUpload}
                                                required
                                                className="w-full"
                                                id="paymentProof"
                                            />
                                            <label htmlFor="paymentProof" className="block mt-2 text-sm text-gray-500 cursor-pointer">
                                                Click to upload or drag and drop
                                            </label>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                                        </div>
                                        {formData.paymentProof && (
                                            <p className="text-green-600 text-sm mt-2 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                File uploaded successfully
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.paymentProof}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Booking Request'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar - Quick Info */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Hostel:</span>
                                        <span className="font-medium">{currentHostel?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium text-gray-900">{currentHostel?.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Booking Type:</span>
                                        <span className="font-medium text-green-600">Stay Extension</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Student:</span>
                                        <span className="font-medium text-blue-600">Yes</span>
                                    </div>
                                </div>

                                {/* Room Availability Summary */}
                                {Object.keys(roomAvailability).length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold text-gray-700 mb-3">Room Availability</h4>
                                        <div className="space-y-2">
                                            {Object.entries(roomAvailability).map(([roomType, stats]) => (
                                                <div key={roomType} className="flex justify-between items-center text-sm">
                                                    <span className="capitalize">{roomType}:</span>
                                                    <span className={`font-medium ${
                                                        stats.available > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {stats.available}/{stats.total}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hostel Amenities */}
                                {currentHostel?.amenities && currentHostel.amenities.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold text-gray-700 mb-3">Amenities</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {currentHostel.amenities.map((amenity, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                                    <p className="text-blue-700 text-sm">
                                        Contact hostel administration for room changes or special requests.
                                    </p>
                                    {currentHostel?.contact?.phone && (
                                        <p className="text-blue-700 text-sm mt-1">
                                            Phone: {currentHostel.contact.phone}
                                        </p>
                                    )}
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

export default StudentBooking;