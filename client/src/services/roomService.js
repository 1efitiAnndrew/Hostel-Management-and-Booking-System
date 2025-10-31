// export const roomService = {
//   // Get all available rooms
//   getAvailableRooms: (filters = {}) => 
//     api.get('/room/available', { params: filters }),

//   // Get available rooms for booking
//   getAvailableRoomsForBooking: (params) => 
//     api.get('/room/available-for-booking', { params }),

//   // Get all rooms for a hostel
//   getHostelRooms: (hostelId, params = {}) => 
//     api.get(`/room/hostel/${hostelId}`, { params }),

//   // Get room by ID
//   getRoomById: (roomId) => 
//     api.get(`/room/${roomId}`),

//   // Create multiple rooms
//   createRooms: (roomData) => 
//     api.post('/room', roomData),

//   // Update room
//   updateRoom: (roomId, updateData) => 
//     api.put(`/room/${roomId}`, updateData),

//   // Update room status
//   updateRoomStatus: (roomId, status) => 
//     api.patch(`/room/${roomId}/status`, { status }),

//   // Auto assign room
//   autoAssignRoom: (bookingId) => 
//     api.post('/room/auto-assign', { bookingId }),

//   // Manual assign room
//   manualAssignRoom: (bookingId, roomId) => 
//     api.post('/room/manual-assign', { bookingId, roomId }),

//   // Check-in student
//   checkInStudent: (bookingId) => 
//     api.post('/room/check-in', { bookingId }),

//   // Check-out student
//   checkOutStudent: (bookingId) => 
//     api.post('/room/check-out', { bookingId }),

//   // Get occupancy report
//   getOccupancyReport: (hostelId) => 
//     api.get(`/room/occupancy/${hostelId}`),

//   // Get room utilization
//   getRoomUtilization: (hostelId) => 
//     api.get(`/room/utilization/${hostelId}`),

//   // Get room dashboard
//   getRoomDashboard: (hostelId) => 
//     api.get(`/room/dashboard/${hostelId}`),

//   // Deactivate room
//   deactivateRoom: (roomId) => 
//     api.delete(`/room/${roomId}/deactivate`),

//   // Reactivate room
//   reactivateRoom: (roomId) => 
//     api.patch(`/room/${roomId}/reactivate`),
// };