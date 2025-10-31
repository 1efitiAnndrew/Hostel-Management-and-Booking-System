// import React, { useState, useEffect } from 'react';
// import { bookingService } from "../../services/bookingService";
// import toast from 'react-hot-toast';

// const Bookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState('pending');
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);

//   const fetchBookings = async (status = 'pending') => {
//     try {
//       setLoading(true);
//       const response = await bookingService.getAllBookings({ status });
//       setBookings(response.data.bookings);
//     } catch (error) {
//       toast.error('Failed to fetch bookings');
//       console.error('Error fetching bookings:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings(selectedStatus);
//   }, [selectedStatus]);

//   const handleApprove = async (bookingId) => {
//     try {
//       await bookingService.approveBooking(bookingId);
//       toast.success('Booking approved successfully!');
//       fetchBookings(selectedStatus);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to approve booking');
//     }
//   };

//   const handleReject = async (bookingId) => {
//     const reason = prompt('Please enter rejection reason:');
//     if (reason) {
//       try {
//         await bookingService.rejectBooking(bookingId, reason);
//         toast.success('Booking rejected successfully!');
//         fetchBookings(selectedStatus);
//       } catch (error) {
//         toast.error(error.response?.data?.message || 'Failed to reject booking');
//       }
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusColors = {
//       pending: 'bg-yellow-100 text-yellow-800',
//       approved: 'bg-green-100 text-green-800',
//       rejected: 'bg-red-100 text-red-800',
//       confirmed: 'bg-blue-100 text-blue-800',
//       'checked-in': 'bg-purple-100 text-purple-800',
//       'checked-out': 'bg-gray-100 text-gray-800'
//     };
    
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
//         {status.replace('-', ' ').toUpperCase()}
//       </span>
//     );
//   };

//   const viewBookingDetails = async (bookingId) => {
//     try {
//       const response = await bookingService.getBookingById(bookingId);
//       setSelectedBooking(response.data.booking);
//       setShowDetailsModal(true);
//     } catch (error) {
//       toast.error('Failed to fetch booking details');
//     }
//   };

//   return (
//     <div className="p-6 text-white">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Booking</h1>
//         <p className="text-gray-400">Manage student bookings and approvals</p>
//       </div>

//       {/* Status Filter */}
//       <div className="flex gap-2 mb-6 overflow-x-auto">
//         {['pending', 'approved', 'confirmed', 'checked-in', 'checked-out', 'rejected'].map((status) => (
//           <button
//             key={status}
//             onClick={() => setSelectedStatus(status)}
//             className={`px-4 py-2 rounded-lg whitespace-nowrap ${
//               selectedStatus === status 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//             }`}
//           >
//             {status.replace('-', ' ').toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {/* Bookings List */}
//       {loading ? (
//         <div className="flex justify-center items-center h-32">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       ) : bookings.length > 0 ? (
//         <div className="space-y-4">
//           {bookings.map((booking) => (
//             <div key={booking._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <h3 className="font-semibold text-lg">
//                     {booking.student?.name || 'Unknown Student'}
//                   </h3>
//                   <p className="text-gray-400">
//                     {booking.hostel?.name} • {booking.roomType} Room
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {getStatusBadge(booking.status)}
//                   <span className="text-sm text-gray-400">
//                     {new Date(booking.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
//                 <div>
//                   <span className="text-gray-400">Check-in:</span>
//                   <div>{new Date(booking.checkInDate).toLocaleDateString()}</div>
//                 </div>
//                 <div>
//                   <span className="text-gray-400">Check-out:</span>
//                   <div>{new Date(booking.checkOutDate).toLocaleDateString()}</div>
//                 </div>
//                 <div>
//                   <span className="text-gray-400">Duration:</span>
//                   <div>{booking.duration} days</div>
//                 </div>
//                 <div>
//                   <span className="text-gray-400">Amount:</span>
//                   <div className="font-semibold">₹{booking.amount}</div>
//                 </div>
//               </div>

//               <div className="flex gap-2 flex-wrap">
//                 <button
//                   onClick={() => viewBookingDetails(booking._id)}
//                   className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
//                 >
//                   View Details
//                 </button>
                
//                 {booking.status === 'pending' && (
//                   <>
//                     <button
//                       onClick={() => handleApprove(booking._id)}
//                       className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => handleReject(booking._id)}
//                       className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
//                     >
//                       Reject
//                     </button>
//                   </>
//                 )}
                
//                 {booking.status === 'approved' && !booking.room && (
//                   <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
//                     Assign Room
//                   </button>
//                 )}
                
//                 {booking.status === 'confirmed' && (
//                   <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
//                     Check In
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12 text-gray-400">
//           No {selectedStatus} bookings found
//         </div>
//       )}

//       {/* Booking Details Modal */}
//       {showDetailsModal && selectedBooking && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-700">
//               <h2 className="text-xl font-semibold">Booking Details</h2>
//               <p className="text-gray-400 text-sm">Booking ID: {selectedBooking._id}</p>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="font-semibold text-gray-300 mb-2">Student Information</h3>
//                   <div className="space-y-2 text-sm">
//                     <div><span className="text-gray-400">Name:</span> {selectedBooking.student?.name}</div>
//                     <div><span className="text-gray-400">Email:</span> {selectedBooking.student?.email}</div>
//                     <div><span className="text-gray-400">Phone:</span> {selectedBooking.student?.phone}</div>
//                     <div><span className="text-gray-400">Course:</span> {selectedBooking.student?.course}</div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h3 className="font-semibold text-gray-300 mb-2">Booking Information</h3>
//                   <div className="space-y-2 text-sm">
//                     <div><span className="text-gray-400">Hostel:</span> {selectedBooking.hostel?.name}</div>
//                     <div><span className="text-gray-400">Room Type:</span> {selectedBooking.roomType}</div>
//                     <div><span className="text-gray-400">Status:</span> {getStatusBadge(selectedBooking.status)}</div>
//                     <div><span className="text-gray-400">Amount:</span> ₹{selectedBooking.amount}</div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="font-semibold text-gray-300 mb-2">Dates</h3>
//                   <div className="space-y-2 text-sm">
//                     <div><span className="text-gray-400">Check-in:</span> {new Date(selectedBooking.checkInDate).toLocaleDateString()}</div>
//                     <div><span className="text-gray-400">Check-out:</span> {new Date(selectedBooking.checkOutDate).toLocaleDateString()}</div>
//                     <div><span className="text-gray-400">Duration:</span> {selectedBooking.duration} days</div>
//                   </div>
//                 </div>
                
//                 {selectedBooking.room && (
//                   <div>
//                     <h3 className="font-semibold text-gray-300 mb-2">Room Assignment</h3>
//                     <div className="space-y-2 text-sm">
//                       <div><span className="text-gray-400">Room:</span> {selectedBooking.roomNumber}</div>
//                       <div><span className="text-gray-400">Assigned At:</span> {new Date(selectedBooking.assignedAt).toLocaleDateString()}</div>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               {selectedBooking.rejectionReason && (
//                 <div>
//                   <h3 className="font-semibold text-gray-300 mb-2">Rejection Reason</h3>
//                   <p className="text-sm bg-red-900 bg-opacity-50 p-3 rounded">{selectedBooking.rejectionReason}</p>
//                 </div>
//               )}
//             </div>
            
//             <div className="p-6 border-t border-gray-700 flex justify-end">
//               <button
//                 onClick={() => setShowDetailsModal(false)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Bookings;