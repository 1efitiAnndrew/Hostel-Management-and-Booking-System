import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentRegistrationForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    
    // Get hostel information from URL parameters or state
    const selectedHostelId = searchParams.get('hostel');
    const selectedHostel = location.state?.selectedHostel;

    // Use the actual hostel ID from your database
    const actualHostel = {
        id: '68f500b910fe35883fe9f1a4', // Your real hostel ID
        name: 'Olympia Hostel',
        location: 'Makerere University Road',
        description: 'Premium student accommodation with modern amenities',
        contact: '+256779435774',
        email: 'olympiahostel@example.com'
    };

    const [formData, setFormData] = useState({
        name: '',
        cms_id: '',
        room_no: '',
        batch: '',
        dept: '',
        course: '',
        email: '',
        father_name: '',
        contact: '',
        address: '',
        dob: '',
        cnic: '',
        hostel: selectedHostelId || actualHostel.id, // Use real hostel ID
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    // Departments and courses
    const departments = [
        'Computer Science',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Business Administration',
        'Medicine',
        'Law',
        'Arts and Social Sciences',
        'Agriculture',
        'Veterinary Medicine'
    ];

    const courses = [
        'Bachelor of Science',
        'Bachelor of Engineering',
        'Bachelor of Arts',
        'Bachelor of Medicine',
        'Bachelor of Laws',
        'Master of Science',
        'Master of Engineering',
        'PhD'
    ];

    const batches = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        if (!selectedHostelId && !selectedHostel) {
            setFormData(prev => ({ ...prev, hostel: actualHostel.id }));
        } else if (selectedHostel) {
            setFormData(prev => ({ ...prev, hostel: selectedHostel.id }));
        }
    }, [selectedHostel, selectedHostelId]);

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.cms_id) newErrors.cms_id = 'CMS ID is required';
        if (!formData.room_no) newErrors.room_no = 'Room number is required';
        if (!formData.batch) newErrors.batch = 'Batch is required';
        if (!formData.dept) newErrors.dept = 'Department is required';
        if (!formData.course) newErrors.course = 'Course is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.father_name.trim()) newErrors.father_name = "Father's name is required";
        if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Contact validation
        if (formData.contact && !/^\d{10,15}$/.test(formData.contact.replace(/\D/g, ''))) {
            newErrors.contact = 'Contact number is invalid';
        }

        // CNIC validation
        if (formData.cnic && !/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
            newErrors.cnic = 'CNIC must be in format: 12345-1234567-1';
        }

        // Password validation
        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // CMS ID validation
        if (formData.cms_id && formData.cms_id.toString().length !== 6) {
            newErrors.cms_id = 'CMS ID must be exactly 6 digits';
        }

        // Contact validation
        if (formData.contact && formData.contact.replace(/\D/g, '').length !== 11) {
            newErrors.contact = 'Contact number must be exactly 11 digits';
        }

        // CNIC validation
        if (formData.cnic && formData.cnic.replace(/\D/g, '').length !== 13) {
            newErrors.cnic = 'CNIC must be exactly 13 digits';
        }

        // Age validation (must be at least 16 years old)
        if (formData.dob) {
            const dob = new Date(formData.dob);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            if (age < 16) {
                newErrors.dob = 'You must be at least 16 years old';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            // Format data according to backend requirements
            const submissionData = {
                name: formData.name,
                cms_id: formData.cms_id.toString(),
                room_no: formData.room_no.toString(),
                batch: formData.batch.toString(),
                dept: formData.dept,
                course: formData.course,
                email: formData.email,
                father_name: formData.father_name,
                contact: formData.contact.replace(/\D/g, ''),
                address: formData.address,
                dob: formData.dob,
                cnic: formData.cnic.replace(/\D/g, ''),
                hostel: actualHostel.id, // Always use the real hostel ID
                password: formData.password
            };

            console.log('Submitting student data with hostel ID:', actualHostel.id);

            // Register student in the database
            const studentResponse = await fetch('http://localhost:3000/api/student/register-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            const studentData = await studentResponse.json();

            if (studentResponse.ok) {
                toast.success(`Registration submitted successfully for ${actualHostel.name}!`);
                
                // Create user account for login
                try {
                    const userData = {
                        email: formData.email,
                        password: formData.password,
                        name: formData.name,
                        role: 'student',
                        cms_id: formData.cms_id,
                        hostel: actualHostel.id
                    };

                    const userResponse = await fetch('http://localhost:3000/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData)
                    });

                    const userResult = await userResponse.json();

                    if (!userResponse.ok) {
                        console.warn('User account creation warning:', userResult);
                    }
                } catch (userError) {
                    console.error('User account creation error:', userError);
                }
                
                // Reset form
                setFormData({
                    name: '',
                    cms_id: '',
                    room_no: '',
                    batch: '',
                    dept: '',
                    course: '',
                    email: '',
                    father_name: '',
                    contact: '',
                    address: '',
                    dob: '',
                    cnic: '',
                    hostel: actualHostel.id,
                    password: '',
                    confirmPassword: ''
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/auth/login');
                }, 2000);
            } else {
                // Handle specific error cases
                if (studentData.errors && studentData.errors.length > 0) {
                    const errorMessage = studentData.errors[0].msg;
                    toast.error(errorMessage);
                    
                    if (errorMessage.includes('hostel') && errorMessage.includes('not found')) {
                        console.error('Hostel not found. ID used:', actualHostel.id);
                        toast.error('Hostel configuration error. Please contact administration.');
                    }
                } else {
                    toast.error(studentData.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Error submitting registration. Please check your connection and try again.');
        }
        setLoading(false);
    };

    // Helper function to format CNIC as user types
    const formatCNIC = (value) => {
        // Remove all non-digits
        const numbers = value.replace(/\D/g, '');
        
        // Format as 12345-1234567-1
        if (numbers.length <= 5) {
            return numbers;
        } else if (numbers.length <= 12) {
            return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
        } else {
            return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
        }
    };

    // Handle CNIC input separately to format it
    const handleCNICChange = (e) => {
        const { value } = e.target;
        const formattedValue = formatCNIC(value);
        setFormData(prev => ({
            ...prev,
            cnic: formattedValue
        }));

        if (errors.cnic) {
            setErrors(prev => ({
                ...prev,
                cnic: ''
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Student Registration - {actualHostel.name}
                    </h1>
                    
                    {/* Hostel Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white font-bold text-lg">O</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-blue-800">{actualHostel.name}</h2>
                                <p className="text-blue-600">{actualHostel.location}</p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-center mb-2">{actualHostel.description}</p>
                        <div className="flex justify-center space-x-6 text-sm text-gray-600">
                            <span>📞 {actualHostel.contact}</span>
                            <span>✉️ {actualHostel.email}</span>
                        </div>
                    </div>

                    <p className="text-gray-600">
                        Please fill in all required details to complete your registration with {actualHostel.name}
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Hidden hostel field with real ID */}
                        <input type="hidden" name="hostel" value={actualHostel.id} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                    Personal Information
                                </h3>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* CMS ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CMS ID (6 digits) *
                                </label>
                                <input
                                    type="number"
                                    name="cms_id"
                                    value={formData.cms_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.cms_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter 6-digit CMS ID"
                                />
                                {errors.cms_id && <p className="text-red-500 text-sm mt-1">{errors.cms_id}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Number (11 digits) *
                                </label>
                                <input
                                    type="tel"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.contact ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter 11-digit contact number"
                                />
                                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.dob ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                            </div>

                            {/* CNIC */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CNIC (13 digits) *
                                </label>
                                <input
                                    type="text"
                                    name="cnic"
                                    value={formData.cnic}
                                    onChange={handleCNICChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.cnic ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="12345-1234567-1"
                                    maxLength="15"
                                />
                                {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>}
                            </div>

                            {/* Father's Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Father's Name *
                                </label>
                                <input
                                    type="text"
                                    name="father_name"
                                    value={formData.father_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.father_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter father's name"
                                />
                                {errors.father_name && <p className="text-red-500 text-sm mt-1">{errors.father_name}</p>}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your complete address"
                                />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                    Academic Information
                                </h3>
                            </div>

                            {/* Batch */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Batch *
                                </label>
                                <select
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.batch ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department *
                                </label>
                                <select
                                    name="dept"
                                    value={formData.dept}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.dept ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                {errors.dept && <p className="text-red-500 text-sm mt-1">{errors.dept}</p>}
                            </div>

                            {/* Course */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course *
                                </label>
                                <select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.course ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                                {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                            </div>

                            {/* Room Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Number *
                                </label>
                                <input
                                    type="number"
                                    name="room_no"
                                    value={formData.room_no}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.room_no ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter room number at Olympia Hostel"
                                />
                                {errors.room_no && <p className="text-red-500 text-sm mt-1">{errors.room_no}</p>}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                    Account Information
                                </h3>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password (min 8 characters) *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter password (min 8 characters)"
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm password"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold text-lg w-full md:w-auto"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering with {actualHostel.name}...
                                    </div>
                                ) : (
                                    `Register with ${actualHostel.name}`
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Hostel Features */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose {actualHostel.name}?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border border-blue-100 rounded-lg">
                            <div className="text-blue-600 text-2xl mb-2">🛏️</div>
                            <h4 className="font-semibold text-gray-800">Comfortable Rooms</h4>
                            <p className="text-sm text-gray-600">Well-furnished single and shared rooms</p>
                        </div>
                        <div className="text-center p-4 border border-blue-100 rounded-lg">
                            <div className="text-blue-600 text-2xl mb-2">📶</div>
                            <h4 className="font-semibold text-gray-800">High-Speed WiFi</h4>
                            <p className="text-sm text-gray-600">Unlimited internet access for studies</p>
                        </div>
                        <div className="text-center p-4 border border-blue-100 rounded-lg">
                            <div className="text-blue-600 text-2xl mb-2">🔒</div>
                            <h4 className="font-semibold text-gray-800">24/7 Security</h4>
                            <p className="text-sm text-gray-600">CCTV surveillance and security personnel</p>
                        </div>
                        <div className="text-center p-4 border border-blue-100 rounded-lg">
                            <div className="text-blue-600 text-2xl mb-2">🍽️</div>
                            <h4 className="font-semibold text-gray-800">Cafeteria</h4>
                            <p className="text-sm text-gray-600">Healthy and hygienic food options</p>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default StudentRegistrationForm;