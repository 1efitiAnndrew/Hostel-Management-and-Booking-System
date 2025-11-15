import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRooms, setNewRooms] = useState([{
    roomNumber: '',
    floor: '',
    roomType: 'single',
    price: '',
    capacity: 1,
    amenities: []
  }]);

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: '',
    roomType: 'single',
    price: '',
    capacity: 1,
    status: 'available',
    amenities: []
  });

  const [newAmenity, setNewAmenity] = useState('');

  // Specific hostel ID - Olympia Hostel
  const OLYMPIA_HOSTEL_ID = '68f500b910fe35883fe9f1a4';

  // Fetch rooms for Olympia Hostel
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms/hostel/${OLYMPIA_HOSTEL_ID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        toast.error(data.message || 'Failed to fetch rooms');
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Error fetching rooms from server');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Create multiple rooms for Olympia Hostel - FIXED
  const handleCreateRooms = async () => {
    try {
      setLoading(true);
      
      // Enhanced validation
      const validationErrors = [];
      newRooms.forEach((room, index) => {
        if (!room.roomNumber?.trim()) {
          validationErrors.push(`Room ${index + 1}: Room Number is required`);
        }
        if (!room.floor || isNaN(room.floor)) {
          validationErrors.push(`Room ${index + 1}: Valid Floor number is required`);
        }
        if (!room.price || isNaN(room.price) || room.price <= 0) {
          validationErrors.push(`Room ${index + 1}: Valid Price is required`);
        }
        if (!room.capacity || isNaN(room.capacity) || room.capacity <= 0) {
          validationErrors.push(`Room ${index + 1}: Valid Capacity is required`);
        }
      });

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]); // Show first error
        return;
      }

      const roomData = {
        hostelId: OLYMPIA_HOSTEL_ID,
        rooms: newRooms.map(room => ({
          roomNumber: room.roomNumber.trim(),
          floor: parseInt(room.floor),
          roomType: room.roomType,
          price: parseInt(room.price),
          capacity: parseInt(room.capacity),
          status: 'available', // Always set to available for new rooms
          amenities: room.amenities || []
        }))
      };
      
      console.log('Sending room data:', roomData); // Debug log
      
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms`, { // FIXED: removed /bulk
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });
      
      const responseData = await res.json();
      console.log('Backend response:', responseData); // Debug log
      
      if (!res.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${res.status}`);
      }
      
      if (responseData.success) {
        const successMessage = `${responseData.rooms.length} room(s) created successfully`;
        if (responseData.errors && responseData.errors.length > 0) {
          toast.success(`${successMessage} (${responseData.errors.length} errors)`);
          console.warn('Room creation errors:', responseData.errors);
        } else {
          toast.success(successMessage);
        }
        
        setShowCreateModal(false);
        setNewRooms([{
          roomNumber: '',
          floor: '',
          roomType: 'single',
          price: '',
          capacity: 1,
          amenities: []
        }]);
        fetchRooms();
      } else {
        toast.error(responseData.message || 'Failed to create rooms');
      }
    } catch (error) {
      console.error('Error creating rooms:', error);
      toast.error(error.message || 'Error creating rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update room - FIXED status validation
  const handleUpdateRoom = async () => {
    try {
      // Enhanced validation
      if (!roomForm.roomNumber?.trim()) {
        toast.error('Room Number is required');
        return;
      }
      if (!roomForm.floor || isNaN(roomForm.floor)) {
        toast.error('Valid Floor number is required');
        return;
      }
      if (!roomForm.price || isNaN(roomForm.price) || roomForm.price <= 0) {
        toast.error('Valid Price is required');
        return;
      }
      if (!roomForm.capacity || isNaN(roomForm.capacity) || roomForm.capacity <= 0) {
        toast.error('Valid Capacity is required');
        return;
      }

      // Remove 'cleaning' status if present (until schema is updated)
      const safeStatus = roomForm.status === 'cleaning' ? 'maintenance' : roomForm.status;

      const roomData = {
        roomNumber: roomForm.roomNumber.trim(),
        floor: parseInt(roomForm.floor),
        roomType: roomForm.roomType,
        price: parseInt(roomForm.price),
        capacity: parseInt(roomForm.capacity),
        status: safeStatus,
        amenities: roomForm.amenities
      };

      console.log('Updating room with data:', roomData); // Debug log
      
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms/${selectedRoom._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });
      
      const responseData = await res.json();
      console.log('Update response:', responseData); // Debug log
      
      if (!res.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${res.status}`);
      }
      
      if (responseData.success) {
        toast.success('Room updated successfully!');
        setShowEditModal(false);
        fetchRooms();
      } else {
        toast.error(responseData.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error(error.message || 'Error updating room. Please try again.');
    }
  };

  // Delete room - FIXED endpoint
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms/${roomId}/deactivate`, { // FIXED: added /deactivate
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      
      if (data.success) {
        toast.success('Room deleted successfully!');
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.message || 'Error deleting room. Please try again.');
    }
  };

  // Room management functions (unchanged)
  const addRoomField = () => {
    setNewRooms([...newRooms, {
      roomNumber: '',
      floor: '',
      roomType: 'single',
      price: '',
      capacity: 1,
      amenities: []
    }]);
  };

  const updateRoomField = (index, field, value) => {
    const updatedRooms = [...newRooms];
    updatedRooms[index][field] = value;
    setNewRooms(updatedRooms);
  };

  const removeRoomField = (index) => {
    if (newRooms.length > 1) {
      setNewRooms(newRooms.filter((_, i) => i !== index));
    }
  };

  // Open edit modal - FIXED status handling
  const openEditModal = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      floor: room.floor.toString(),
      roomType: room.roomType,
      price: room.price.toString(),
      capacity: room.capacity,
      status: room.status === 'cleaning' ? 'maintenance' : room.status, // Handle 'cleaning' status
      amenities: room.amenities || []
    });
    setShowEditModal(true);
  };

  // Open create modal (unchanged)
  const openCreateModal = () => {
    setNewRooms([{
      roomNumber: '',
      floor: '',
      roomType: 'single',
      price: '',
      capacity: 1,
      amenities: []
    }]);
    setShowCreateModal(true);
  };

  // Add amenity to room form (unchanged)
  const addAmenity = () => {
    if (newAmenity.trim() && !roomForm.amenities.includes(newAmenity.trim())) {
      setRoomForm({
        ...roomForm,
        amenities: [...roomForm.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  // Remove amenity from room form (unchanged)
  const removeAmenity = (amenity) => {
    setRoomForm({
      ...roomForm,
      amenities: roomForm.amenities.filter(a => a !== amenity)
    });
  };

  // Add amenity to new room (unchanged)
  const addAmenityToNewRoom = (roomIndex, amenity) => {
    if (amenity.trim()) {
      const updatedRooms = [...newRooms];
      if (!updatedRooms[roomIndex].amenities.includes(amenity.trim())) {
        updatedRooms[roomIndex].amenities = [...updatedRooms[roomIndex].amenities, amenity.trim()];
        setNewRooms(updatedRooms);
      }
    }
  };

  // Remove amenity from new room (unchanged)
  const removeAmenityFromNewRoom = (roomIndex, amenity) => {
    const updatedRooms = [...newRooms];
    updatedRooms[roomIndex].amenities = updatedRooms[roomIndex].amenities.filter(a => a !== amenity);
    setNewRooms(updatedRooms);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      occupied: 'bg-red-100 text-red-800 border-red-200',
      reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      maintenance: 'bg-gray-100 text-gray-800 border-gray-200',
      cleaning: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const displayStatus = status === 'cleaning' ? 'maintenance' : status;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[displayStatus] || 'bg-gray-100 text-gray-800'}`}>
        {displayStatus?.charAt(0).toUpperCase() + displayStatus?.slice(1) || 'Available'}
      </span>
    );
  };

  const getRoomTypeBadge = (roomType) => {
    const typeColors = {
      single: 'bg-purple-100 text-purple-800 border-purple-200',
      double: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      triple: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[roomType] || 'bg-gray-100 text-gray-800'}`}>
        {roomType?.charAt(0).toUpperCase() + roomType?.slice(1)}
      </span>
    );
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Room Management</h1>
            <p className="text-lg text-gray-600">Managing rooms for Olympia Hostel</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Rooms
          </button>
        </div>

        {/* Hostel Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Olympia Hostel</h2>
              <p className="text-gray-600">Hostel ID: {OLYMPIA_HOSTEL_ID}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Rooms: {rooms.length}</p>
              <p className="text-sm text-gray-600">Available: {rooms.filter(room => room.status === 'available').length}</p>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rooms.map((room) => (
                <div key={room._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">Room {room.roomNumber}</h3>
                      <p className="text-gray-600 text-sm mt-1">Floor {room.floor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(room.status)}
                      {getRoomTypeBadge(room.roomType)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold text-gray-900">
                        {room.currentOccupancy || 0}/{room.capacity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-lg text-blue-600">${room.price}/month</span>
                    </div>
                    
                    {room.amenities && room.amenities.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-2">Amenities:</span>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <span key={index} className="bg-white px-2 py-1 rounded border text-xs text-gray-700">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No rooms found for Olympia Hostel</div>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Create First Room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Rooms Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create Multiple Rooms</h2>
              <p className="text-gray-600">Add multiple rooms to Olympia Hostel</p>
            </div>
            
            <div className="p-6 space-y-6">
              {newRooms.map((room, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">Room {index + 1}</h3>
                    {newRooms.length > 1 && (
                      <button
                        onClick={() => removeRoomField(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove Room
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        value={room.roomNumber}
                        onChange={(e) => updateRoomField(index, 'roomNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 101, 201A"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor *
                      </label>
                      <input
                        type="number"
                        value={room.floor}
                        onChange={(e) => updateRoomField(index, 'floor', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type *
                      </label>
                      <select
                        value={room.roomType}
                        onChange={(e) => updateRoomField(index, 'roomType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        value={room.capacity}
                        onChange={(e) => updateRoomField(index, 'capacity', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Month ($) *
                      </label>
                      <input
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoomField(index, 'price', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 500"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Amenities for this room */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Add amenity (WiFi, AC, etc.)"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAmenityToNewRoom(index, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          addAmenityToNewRoom(index, input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, amenityIndex) => (
                        <span
                          key={amenityIndex}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenityFromNewRoom(index, amenity)}
                            className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addRoomField}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Room
              </button>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRooms}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? 'Creating...' : `Create ${newRooms.length} Room${newRooms.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal - FIXED status options */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Room</h2>
              <p className="text-gray-600">Update room details for Olympia Hostel</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor *
                  </label>
                  <input
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({...roomForm, roomType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({...roomForm, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                    {/* Removed 'cleaning' until schema is updated */}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Month ($) *
                  </label>
                  <input
                    type="number"
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({...roomForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add amenity (WiFi, AC, Electricity)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAmenity();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roomForm.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRoom}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Update Room
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
};

export default Rooms;
