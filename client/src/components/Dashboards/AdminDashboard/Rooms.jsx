// import React, { useState } from 'react';
// import { roomService } from '../../services/roomService';
// import toast from 'react-hot-toast';

// const Rooms = () => {
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedHostel, setSelectedHostel] = useState('');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newRooms, setNewRooms] = useState([{
//     roomNumber: '',
//     floor: '',
//     roomType: 'single',
//     price: '',
//     capacity: 1,
//     amenities: []
//   }]);

//   const fetchRooms = async (hostelId) => {
//     if (!hostelId) return;
    
//     try {
//       setLoading(true);
//       const response = await roomService.getHostelRooms(hostelId);
//       setRooms(response.data.rooms);
//     } catch (error) {
//       toast.error('Failed to fetch rooms');
//       console.error('Error fetching rooms:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateRooms = async () => {
//     try {
//       setLoading(true);
//       const roomData = {
//         hostelId: selectedHostel,
//         rooms: newRooms.map(room => ({
//           ...room,
//           floor: parseInt(room.floor),
//           price: parseInt(room.price),
//           capacity: parseInt(room.capacity)
//         }))
//       };
      
//       await roomService.createRooms(roomData);
//       toast.success('Rooms created successfully!');
//       setShowCreateModal(false);
//       setNewRooms([{
//         roomNumber: '',
//         floor: '',
//         roomType: 'single',
//         price: '',
//         capacity: 1,
//         amenities: []
//       }]);
//       fetchRooms(selectedHostel);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to create rooms');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addRoomField = () => {
//     setNewRooms([...newRooms, {
//       roomNumber: '',
//       floor: '',
//       roomType: 'single',
//       price: '',
//       capacity: 1,
//       amenities: []
//     }]);
//   };

//   const updateRoomField = (index, field, value) => {
//     const updatedRooms = [...newRooms];
//     updatedRooms[index][field] = value;
//     setNewRooms(updatedRooms);
//   };

//   const getStatusBadge = (status) => {
//     const statusColors = {
//       available: 'bg-green-100 text-green-800',
//       occupied: 'bg-red-100 text-red-800',
//       reserved: 'bg-yellow-100 text-yellow-800',
//       maintenance: 'bg-gray-100 text-gray-800',
//       cleaning: 'bg-blue-100 text-blue-800'
//     };
    
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
//         {status.toUpperCase()}
//       </span>
//     );
//   };

//   return (
//     <div className="p-6 text-white">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">Room</h1>
//           <p className="text-gray-400">Manage hostel rooms and availability</p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Add Rooms
//         </button>
//       </div>

//       {/* Hostel Selection */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-300 mb-2">
//           Select Hostel
//         </label>
//         <select
//           value={selectedHostel}
//           onChange={(e) => {
//             setSelectedHostel(e.target.value);
//             fetchRooms(e.target.value);
//           }}
//           className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-full max-w-xs"
//         >
//           <option value="">Select a hostel</option>
//           <option value="hostel-1">Hostel A</option>
//           <option value="hostel-2">Hostel B</option>
//           {/* You can dynamically populate this from your hostels */}
//         </select>
//       </div>

//       {/* Rooms Grid */}
//       {loading ? (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       ) : rooms.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {rooms.map((room) => (
//             <div key={room._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
//                   <p className="text-gray-400 text-sm">Floor {room.floor} • {room.roomType}</p>
//                 </div>
//                 {getStatusBadge(room.status)}
//               </div>
              
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Capacity:</span>
//                   <span>{room.currentOccupancy}/{room.capacity}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Price:</span>
//                   <span className="font-semibold">₹{room.price}/month</span>
//                 </div>
                
//                 {room.amenities && room.amenities.length > 0 && (
//                   <div>
//                     <span className="text-gray-400">Amenities:</span>
//                     <div className="flex flex-wrap gap-1 mt-1">
//                       {room.amenities.map((amenity, index) => (
//                         <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
//                           {amenity}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-4 flex gap-2">
//                 <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm">
//                   Edit
//                 </button>
//                 <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm">
//                   Manage
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : selectedHostel ? (
//         <div className="text-center py-12">
//           <div className="text-gray-400 mb-4">No rooms found for this hostel</div>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//           >
//             Create First Room
//           </button>
//         </div>
//       ) : (
//         <div className="text-center py-12 text-gray-400">
//           Please select a hostel to view rooms
//         </div>
//       )}

//       {/* Create Rooms Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-700">
//               <h2 className="text-xl font-semibold">Create Multiple Rooms</h2>
//               <p className="text-gray-400 text-sm">Add multiple rooms to the selected hostel</p>
//             </div>
            
//             <div className="p-6 space-y-4">
//               {newRooms.map((room, index) => (
//                 <div key={index} className="border border-gray-700 rounded-lg p-4">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="font-semibold">Room {index + 1}</h3>
//                     {newRooms.length > 1 && (
//                       <button
//                         onClick={() => setNewRooms(newRooms.filter((_, i) => i !== index))}
//                         className="text-red-400 hover:text-red-300"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-1">
//                         Room Number
//                       </label>
//                       <input
//                         type="text"
//                         value={room.roomNumber}
//                         onChange={(e) => updateRoomField(index, 'roomNumber', e.target.value)}
//                         className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
//                         placeholder="e.g., 101"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-1">
//                         Floor
//                       </label>
//                       <input
//                         type="number"
//                         value={room.floor}
//                         onChange={(e) => updateRoomField(index, 'floor', e.target.value)}
//                         className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
//                         placeholder="e.g., 1"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-1">
//                         Room Type
//                       </label>
//                       <select
//                         value={room.roomType}
//                         onChange={(e) => updateRoomField(index, 'roomType', e.target.value)}
//                         className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
//                       >
//                         <option value="single">Single</option>
//                         <option value="double">Double</option>
//                         <option value="triple">Triple</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-1">
//                         Capacity
//                       </label>
//                       <input
//                         type="number"
//                         value={room.capacity}
//                         onChange={(e) => updateRoomField(index, 'capacity', e.target.value)}
//                         className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
//                         min="1"
//                         max="10"
//                       />
//                     </div>
                    
//                     <div className="col-span-2">
//                       <label className="block text-sm font-medium text-gray-300 mb-1">
//                         Price per Month
//                       </label>
//                       <input
//                         type="number"
//                         value={room.price}
//                         onChange={(e) => updateRoomField(index, 'price', e.target.value)}
//                         className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
//                         placeholder="e.g., 5000"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
              
//               <button
//                 onClick={addRoomField}
//                 className="w-full border-2 border-dashed border-gray-600 rounded-lg py-4 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
//               >
//                 + Add Another Room
//               </button>
//             </div>
            
//             <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
//               <button
//                 onClick={() => setShowCreateModal(false)}
//                 className="px-4 py-2 text-gray-300 hover:text-white"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCreateRooms}
//                 disabled={loading}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
//               >
//                 {loading ? 'Creating...' : `Create ${newRooms.length} Room${newRooms.length > 1 ? 's' : ''}`}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Rooms;