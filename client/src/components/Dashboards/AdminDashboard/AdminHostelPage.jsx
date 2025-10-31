import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminHostelPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Fetch all hostels
  const getHostels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/hostel`, {
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

      const res = await fetch(`http://localhost:3000/api/hostel`, {
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

      const res = await fetch(`http://localhost:3000/api/hostel/${selectedHostel._id}`, {
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
      const res = await fetch(`http://localhost:3000/api/hostel/${hostelId}`, {
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

  // Calculate total available rooms from room types
  const calculateTotalAvailable = () => {
    return hostelForm.roomTypes.reduce((total, room) => total + (room.available || 0), 0);
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
        <div className="bg-white rounded-lg shadow-md p-6">
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
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteHostel(hostel._id)}
                            className="text-red-600 hover:text-red-900 hover:scale-110 transition-all"
                            title="Delete"
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
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {showCreateModal ? 'Create New Hostel' : 'Edit Hostel'}
              </h3>
              
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hostel Name *
                    </label>
                    <input
                      type="text"
                      value={hostelForm.name}
                      onChange={(e) => setHostelForm({...hostelForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter hostel name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={hostelForm.location}
                      onChange={(e) => setHostelForm({...hostelForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Rooms
                    </label>
                    <input
                      type="number"
                      value={hostelForm.rooms}
                      onChange={(e) => setHostelForm({...hostelForm, rooms: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Capacity
                    </label>
                    <input
                      type="number"
                      value={hostelForm.capacity}
                      onChange={(e) => setHostelForm({...hostelForm, capacity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vacant Rooms
                    </label>
                    <input
                      type="number"
                      value={hostelForm.vacant}
                      onChange={(e) => setHostelForm({...hostelForm, vacant: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price/Semester ($)
                    </label>
                    <input
                      type="number"
                      value={hostelForm.pricePerSemester}
                      onChange={(e) => setHostelForm({...hostelForm, pricePerSemester: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={hostelForm.description}
                    onChange={(e) => setHostelForm({...hostelForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hostel description"
                    rows="3"
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={hostelForm.contact.phone}
                      onChange={(e) => setHostelForm({
                        ...hostelForm, 
                        contact: {...hostelForm.contact, phone: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={hostelForm.contact.email}
                      onChange={(e) => setHostelForm({
                        ...hostelForm, 
                        contact: {...hostelForm.contact, email: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                {/* Room Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Types & Pricing
                  </label>
                  <div className="space-y-3">
                    {hostelForm.roomTypes.map((room, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-md">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                          <input
                            type="text"
                            value={room.type}
                            onChange={(e) => updateRoomType(index, 'type', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm capitalize"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                          <input
                            type="number"
                            value={room.price}
                            onChange={(e) => updateRoomType(index, 'price', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Available</label>
                          <input
                            type="number"
                            value={room.available}
                            onChange={(e) => updateRoomType(index, 'available', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add amenity (WiFi, Laundry, etc.)"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hostelForm.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add image URL"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hostelForm.images.map((image, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        Image {index + 1}
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

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