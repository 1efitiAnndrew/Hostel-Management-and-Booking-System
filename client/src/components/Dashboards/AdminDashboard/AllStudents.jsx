import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AllStudents() {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAllStudents = async () => {
    try {
      // Get hostel from localStorage
      const hostelData = JSON.parse(localStorage.getItem('hostel'));
      
      if (!hostelData || !hostelData._id) {
        throw new Error('No hostel information found. Please make sure you are logged in as an admin.');
      }

      console.log("Fetching students for hostel:", hostelData._id);
      
      const response = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/student/get-all-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          hostel: hostelData._id
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.msg || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response data:", data);
      
      return data;
    } catch (error) {
      console.error("Error in getAllStudents:", error);
      throw error;
    }
  };

  const getCSV = async () => {
    try {
      const hostel = JSON.parse(localStorage.getItem('hostel'));
      if (!hostel || !hostel._id) {
        toast.error('Hostel information not found', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const res = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/student/csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostel: hostel._id }),
      });
      const data = await res.json();
      if (data.success) {
        const link = document.createElement('a');
        link.href = "data:text/csv;charset=utf-8," + escape(data.csv);
        link.download = 'students.csv';
        link.click();
        toast.success('CSV Downloaded Successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(data.errors?.[0]?.msg || 'Failed to download CSV', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("CSV download error:", error);
      toast.error('Error downloading CSV', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllStudents();
      
      if (data && data.success && data.students) {
        setAllStudents(data.students);
        toast.success(`Loaded ${data.students.length} students`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.message);
      toast.error(`Failed to load students: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      setAllStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const res = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/student/delete-student", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setAllStudents(prevStudents => prevStudents.filter((student) => student._id !== id));
        toast.success('Student Deleted Successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(data.errors?.[0]?.msg || 'Failed to delete student', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Error deleting student', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const refreshStudents = () => {
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">All Students</h1>
          <p className="text-lg text-gray-600">Manage and view all registered students</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={getCSV}
              disabled={allStudents.length === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
            <button
              onClick={refreshStudents}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Total Students: <span className="font-semibold">{allStudents.length}</span>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h2 className="text-2xl font-bold text-white">Students List</h2>
            <p className="text-blue-100 mt-1">All registered students in the system</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Students</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refreshStudents}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : allStudents.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Students Found</h3>
                <p className="text-gray-600">There are no students registered in this hostel yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CMS ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {student.cms_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Room {student.room_no || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.contact || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 hover:scale-110 transition-all"
                              title="Edit Student"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteStudent(student._id)}
                              className="text-red-600 hover:text-red-900 hover:scale-110 transition-all"
                              title="Delete Student"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      </div>

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

export default AllStudents;