import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminHostelPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [hostelForm, setHostelForm] = useState({
    name: '',
    location: '',
    rooms: 0,
    capacity: 0,
    vacant: 0,
    pricePerSemester: 0,
    description: '',
    roomTypes: [
      { type: 'single', price: 0, available: 0 },
      { type: 'double', price: 0, available: 0 },
      { type: 'triple', price: 0, available: 0 }
    ],
    amenities: [],
    images: [],
    contact: {
      phone: '',
      email: ''
    }
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newImage, setNewImage] = useState('');
  
  // Room management state
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [newRooms, setNewRooms] = useState([{
    roomNumber: '',
    floor: '',
    roomType: 'single',
    price: '',
    capacity: 1,
    amenities: []
  }]);

  // Fetch all hostels
  const getHostels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms`, {
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

  // Fetch rooms for a specific hostel
  const fetchRooms = async (hostelId) => {
    if (!hostelId) return;
    
    try {
      setRoomsLoading(true);
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms/hostel/${hostelId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      toast.error('Error fetching rooms');
      console.error('Error fetching rooms:', error);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Create new hostel
  const createHostel = async () => {
    try {
      // Validate form
      if (!hostelForm.name || !hostelForm.location) {
        toast.error('Name and Location are required fields', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/hostel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hostelForm),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hostel created successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        setShowCreateModal(false);
        resetForm();
        getHostels();
      } else {
        toast.error(data.message || 'Failed to create hostel', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Error creating hostel', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Update hostel
  const updateHostel = async () => {
    try {
      if (!hostelForm.name || !hostelForm.location) {
        toast.error('Name and Location are required fields', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/hostel/${selectedHostel._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hostelForm),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hostel updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        setShowEditModal(false);
        getHostels();
      } else {
        toast.error(data.message || 'Failed to update hostel', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Error updating hostel', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Delete hostel
  const deleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) return;

    try {
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/hostel/${hostelId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Hostel deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        getHostels();
      } else {
        toast.error(data.message || 'Failed to delete hostel', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Error deleting hostel', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Create multiple rooms
  const handleCreateRooms = async () => {
    try {
      setRoomsLoading(true);
      const roomData = {
        hostelId: selectedHostel._id,
        rooms: newRooms.map(room => ({
          ...room,
          floor: parseInt(room.floor),
          price: parseInt(room.price),
          capacity: parseInt(room.capacity)
        }))
      };
      
      const res = await fetch(`https://hostel-management-and-booking-systems.onrender.com/api/rooms/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Rooms created successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        setShowRoomsModal(false);
        setNewRooms([{
          roomNumber: '',
          floor: '',
          roomType: 'single',
          price: '',
          capacity: 1,
          amenities: []
        }]);
        fetchRooms(selectedHostel._id);
      } else {
        toast.error(data.message || 'Failed to create rooms');
      }
    } catch (error) {
      toast.error('Error creating rooms');
    } finally {
      setRoomsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setHostelForm({
      name: '',
      location: '',
      rooms: 0,
      capacity: 0,
      vacant: 0,
      pricePerSemester: 0,
      description: '',
      roomTypes: [
        { type: 'single', price: 0, available: 0 },
        { type: 'double', price: 0, available: 0 },
        { type: 'triple', price: 0, available: 0 }
      ],
      amenities: [],
      images: [],
      contact: {
        phone: '',
        email: ''
      }
    });
    setNewAmenity('');
    setNewImage('');
  };

  // Open edit modal
  const openEditModal = (hostel) => {
    setSelectedHostel(hostel);
    setHostelForm({
      name: hostel.name,
      location: hostel.location,
      rooms: hostel.rooms || 0,
      capacity: hostel.capacity || 0,
      vacant: hostel.vacant || 0,
      pricePerSemester: hostel.pricePerSemester || 0,
      description: hostel.description || '',
      roomTypes: hostel.roomTypes || [
        { type: 'single', price: 0, available: 0 },
        { type: 'double', price: 0, available: 0 },
        { type: 'triple', price: 0, available: 0 }
      ],
      amenities: hostel.amenities || [],
      images: hostel.images || [],
      contact: hostel.contact || { phone: '', email: '' }
    });
    setShowEditModal(true);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open rooms modal for specific hostel
  const openRoomsModal = (hostel) => {
    setSelectedHostel(hostel);
    setShowRoomsModal(true);
    fetchRooms(hostel._id);
  };

  // Add amenity
  const addAmenity = () => {
    if (newAmenity.trim() && !hostelForm.amenities.includes(newAmenity.trim())) {
      setHostelForm({
        ...hostelForm,
        amenities: [...hostelForm.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  // Remove amenity
  const removeAmenity = (amenity) => {
    setHostelForm({
      ...hostelForm,
      amenities: hostelForm.amenities.filter(a => a !== amenity)
    });
  };

  // Add image URL
  const addImage = () => {
    if (newImage.trim() && !hostelForm.images.includes(newImage.trim())) {
      setHostelForm({
        ...hostelForm,
        images: [...hostelForm.images, newImage.trim()]
      });
      setNewImage('');
    }
  };

  // Remove image
  const removeImage = (image) => {
    setHostelForm({
      ...hostelForm,
      images: hostelForm.images.filter(img => img !== image)
    });
  };

  // Update room type
  const updateRoomType = (index, field, value) => {
    const updatedRoomTypes = [...hostelForm.roomTypes];
    updatedRoomTypes[index] = {
      ...updatedRoomTypes[index],
      [field]: field === 'price' || field === 'available' ? parseInt(value) || 0 : value
    };
    setHostelForm({
      ...hostelForm,
      roomTypes: updatedRoomTypes
    });
  };

  // Room management functions
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

  const getStatusBadge = (status) => {
    const statusColors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-gray-100 text-gray-800',
      cleaning: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status?.toUpperCase() || 'AVAILABLE'}
      </span>
    );
  };

  useEffect(() => {
    getHostels();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hostel Management</h1>
            <p className="text-lg text-gray-600">Manage all hostels in the system</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add New Hostel
          </button>
        </div>

        {/* Hostels List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hostels...</p>
            </div>
          ) : hostels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No hostels found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hostel Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rooms / Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hostels.map((hostel) => (
                    <tr key={hostel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{hostel.name}</div>
                        <div className="text-sm text-gray-500">{hostel.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{hostel.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hostel.rooms} rooms / {hostel.capacity} capacity
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hostel.vacant} vacant
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${hostel.pricePerSemester || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(hostel)}
                            className="text-blue-600 hover:text-blue-900 hover:scale-110 transition-all"
                            title="Edit Hostel"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openRoomsModal(hostel)}
                            className="text-green-600 hover:text-green-900 hover:scale-110 transition-all"
                            title="Manage Rooms"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteHostel(hostel._id)}
                            className="text-red-600 hover:text-red-900 hover:scale-110 transition-all"
                            title="Delete Hostel"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rooms Section for Selected Hostel */}
        {selectedHostel && showRoomsModal && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rooms in {selectedHostel.name}</h2>
                <p className="text-gray-600">Manage rooms for this hostel</p>
              </div>
              <button
                onClick={addRoomField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Rooms
              </button>
            </div>

            {roomsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rooms.map((room) => (
                  <div key={room._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">Room {room.roomNumber}</h3>
                        <p className="text-gray-600 text-sm">Floor {room.floor} • {room.roomType}</p>
                      </div>
                      {getStatusBadge(room.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="text-gray-900">{room.currentOccupancy || 0}/{room.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-gray-900">${room.price}/month</span>
                      </div>
                      
                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <span className="text-gray-600">Amenities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {room.amenities.map((amenity, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded text-sm transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No rooms found for this hostel</div>
                <button
                  onClick={addRoomField}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create First Room
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Hostel Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {showCreateModal ? 'Create New Hostel' : 'Edit Hostel'}
              </h3>
              
              {/* ... (existing hostel form content remains the same) ... */}
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showCreateModal ? createHostel : updateHostel}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {showCreateModal ? 'Create Hostel' : 'Update Hostel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Rooms Modal */}
      {showRoomsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Multiple Rooms</h2>
              <p className="text-gray-600 text-sm">Add multiple rooms to {selectedHostel?.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {newRooms.map((room, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Room {index + 1}</h3>
                    {newRooms.length > 1 && (
                      <button
                        onClick={() => setNewRooms(newRooms.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={room.roomNumber}
                        onChange={(e) => updateRoomField(index, 'roomNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 101"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor
                      </label>
                      <input
                        type="number"
                        value={room.floor}
                        onChange={(e) => updateRoomField(index, 'floor', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type
                      </label>
                      <select
                        value={room.roomType}
                        onChange={(e) => updateRoomField(index, 'roomType', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={room.capacity}
                        onChange={(e) => updateRoomField(index, 'capacity', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Month ($)
                      </label>
                      <input
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoomField(index, 'price', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addRoomField}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                + Add Another Room
              </button>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowRoomsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRooms}
                disabled={roomsLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {roomsLoading ? 'Creating...' : `Create ${newRooms.length} Room${newRooms.length > 1 ? 's' : ''}`}
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

export default AdminHostelPage;