import { useState, useEffect } from "react";
import { Input } from "./Input";
import { Button } from "../Common/PrimaryButton";
import { Loader } from "../Common/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterStudent() {
  const [formData, setFormData] = useState({
    name: "",
    cms_id: "",
    room_no: "",
    batch: "",
    dept: "",
    course: "",
    email: "",
    father_name: "",
    contact: "",
    address: "",
    dob: "",
    cnic: "",
    hostel: "", // Will store hostel name
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin/manager
    const admin = JSON.parse(localStorage.getItem("admin"));
    const student = JSON.parse(localStorage.getItem("student"));
    
    setIsAdmin(!!admin);
    
    if (admin) {
      // Admin is registering - fetch hostels for selection
      fetchHostels();
    } else if (student && student.hostel) {
      // Student is already assigned to a hostel (if applicable)
      setFormData(prev => ({ ...prev, hostel: student.hostel }));
    }
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/hostel");
      const data = await res.json();
      if (data.success) {
        setHostels(data.hostels);
        // Set default hostel if only one exists
        if (data.hostels.length === 1) {
          setFormData(prev => ({ ...prev, hostel: data.hostels[0].name }));
        }
      } else {
        toast.error("Failed to fetch hostels", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error fetching hostels:", error);
      toast.error("Error loading hostels", { position: "top-right" });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast.info('Random password generated! Student should change it after first login.', {
      position: "top-right",
      autoClose: 4000,
    });
  };

  const registerStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.name || !formData.cms_id || !formData.email || !formData.cnic) {
        toast.error('Please fill all required fields', {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      // Validate hostel selection for admin
      if (isAdmin && !formData.hostel) {
        toast.error('Please select a hostel for the student', {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      // Prepare student data - using hostel name
      const studentData = {
        name: formData.name,
        cms_id: parseInt(formData.cms_id),
        room_no: formData.room_no ? parseInt(formData.room_no) : undefined,
        batch: formData.batch ? parseInt(formData.batch) : undefined,
        dept: formData.dept,
        course: formData.course,
        email: formData.email,
        father_name: formData.father_name,
        contact: formData.contact,
        address: formData.address,
        dob: formData.dob,
        cnic: formData.cnic,
        password: formData.password || "default123"
      };

      // Only include hostel name if admin is registering and hostel is selected
      if (isAdmin && formData.hostel) {
        studentData.hostel = formData.hostel; // Send hostel name
      }

      console.log("Sending student data:", studentData);

      const res = await fetch("http://localhost:3000/api/student/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });
      
      if (!res.ok) {
        if (res.status === 503) {
          throw new Error("Database connection failed");
        }
        throw new Error("Server error");
      }
      
      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        toast.success(
          `Student ${data.student.name} Registered Successfully!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset form
        setFormData({
          name: "",
          cms_id: "",
          room_no: "",
          batch: "",
          dept: "",
          course: "",
          email: "",
          father_name: "",
          contact: "",
          address: "",
          dob: "",
          cnic: "",
          hostel: isAdmin ? "" : formData.hostel,
          password: ""
        });
        
      } else {
        // Handle validation errors
        if (data.errors) {
          data.errors.forEach((err) => {
            toast.error(err.msg, { position: "top-right", autoClose: 4000 });
          });
        } else {
          toast.error(data.message || "Registration failed!", { 
            position: "top-right", 
            autoClose: 4000 
          });
        }
      }
    } catch (err) {
      toast.error("Network error! Please try again.", { 
        position: "top-right", 
        autoClose: 4000 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    {
      name: "name",
      placeholder: "Full Name *",
      type: "text",
      required: true,
      value: formData.name,
      onChange: (e) => handleInputChange('name', e.target.value)
    },
    {
      name: "cms_id",
      placeholder: "CMS ID *",
      type: "number",
      required: true,
      value: formData.cms_id,
      onChange: (e) => handleInputChange('cms_id', e.target.value)
    },
    {
      name: "email",
      placeholder: "Email Address *",
      type: "email",
      required: true,
      value: formData.email,
      onChange: (e) => handleInputChange('email', e.target.value)
    },
    {
      name: "cnic",
      placeholder: "CNIC Number *",
      type: "text",
      required: true,
      value: formData.cnic,
      onChange: (e) => handleInputChange('cnic', e.target.value)
    },
    {
      name: "contact",
      placeholder: "Contact Number",
      type: "text",
      required: false,
      value: formData.contact,
      onChange: (e) => handleInputChange('contact', e.target.value)
    },
    {
      name: "father_name",
      placeholder: "Father's Name",
      type: "text",
      required: false,
      value: formData.father_name,
      onChange: (e) => handleInputChange('father_name', e.target.value)
    },
    {
      name: "dob",
      placeholder: "Date of Birth",
      type: "date",
      required: false,
      value: formData.dob,
      onChange: (e) => handleInputChange('dob', e.target.value)
    },
    {
      name: "room_no",
      placeholder: "Room Number",
      type: "number",
      required: false,
      value: formData.room_no,
      onChange: (e) => handleInputChange('room_no', e.target.value)
    },
    {
      name: "batch",
      placeholder: "Batch Year",
      type: "number",
      required: false,
      value: formData.batch,
      onChange: (e) => handleInputChange('batch', e.target.value)
    },
    {
      name: "dept",
      placeholder: "Department",
      type: "text",
      required: false,
      value: formData.dept,
      onChange: (e) => handleInputChange('dept', e.target.value)
    },
    {
      name: "course",
      placeholder: "Course/Program",
      type: "text",
      required: false,
      value: formData.course,
      onChange: (e) => handleInputChange('course', e.target.value)
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            
            {isAdmin ? "Register New Student" : "Student Registration"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isAdmin 
              ? "Register a new student in Olympia Hostel" 
              : "Create your student account for hostel management"
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`p-6 ${isAdmin ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-green-600 to-emerald-700'}`}>
            <h2 className="text-2xl font-bold text-white">
              {isAdmin ? "Student Information" : "Create Your Account"}
            </h2>
            <p className="text-blue-100 mt-1">
              {isAdmin 
                ? "Fill in the student details below" 
                : "Provide your information to get started"
              }
            </p>
          </div>
          
          <div className="p-8">
            <form onSubmit={registerStudent} className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inputFields.slice(0, 7).map((field, index) => (
                    <div key={field.name} className="space-y-2">
                      <Input field={field} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Academic Information
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inputFields.slice(7).map((field, index) => (
                    <div key={field.name} className="space-y-2">
                      <Input field={field} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Hostel Selection (Only for Admin) */}
              {isAdmin && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Hostel Assignment
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Hostel *
                      </label>
                      <select
                        value={formData.hostel}
                        onChange={(e) => handleInputChange('hostel', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        required
                      >
                        <option value="">Choose a hostel</option>
                        {hostels.map(hostel => (
                          <option key={hostel._id} value={hostel.name}>
                            {hostel.name} - {hostel.location} ({hostel.vacant || 0} vacant)
                          </option>
                        ))}
                      </select>
                      {hostels.length === 0 && (
                        <p className="text-sm text-red-500">No hostels available. Please create hostels first.</p>
                      )}
                    </div>
                    
                    {/* Password Management for Admin */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Student Password
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Set temporary password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Student will use this password for first login
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Residential Information
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permanent Address {isAdmin ? '' : '*'}
                  </label>
                  <textarea
                    placeholder="Enter complete permanent address..."
                    required={!isAdmin}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit"
                  disabled={loading || (isAdmin && hostels.length === 0)}
                  className={`w-full max-w-md text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    isAdmin 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader />
                      <span>Registering Student...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{isAdmin ? 'Register Student' : 'Create Account'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {isAdmin ? 'Admin Registration Guide' : 'Student Registration Info'}
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Required Information</h4>
              <ul className="space-y-1">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Full Name</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>CMS ID (Unique)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Email Address</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>CNIC Number</span>
                </li>
                {isAdmin && (
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Hostel Selection</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                {isAdmin ? 'Admin Notes' : 'Student Notes'}
              </h4>
              <ul className="space-y-1">
                {isAdmin ? (
                  <>
                    <li>• Password will be sent to student email</li>
                    <li>• Room assignment can be done later</li>
                    <li>• Student can update profile after login</li>
                    <li>• Hostel is assigned by name</li>
                  </>
                ) : (
                  <>
                    <li>• You'll receive login credentials via email</li>
                    <li>• Hostel assignment pending admin approval</li>
                    <li>• Complete your profile after registration</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
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

export default RegisterStudent;
