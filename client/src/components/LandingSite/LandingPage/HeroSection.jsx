import { Link } from "react-router-dom";

function HeroSection() {
  // Sample hostel data - replace with actual hostel data from your backend
  const featuredHostels = [
    {
      id: 1,
      name: "University Hostel A",
      location: "Makerere Main Campus",
      description: "Modern hostel with WiFi, security, and study rooms",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      availableRooms: 12,
      priceRange: "UGX 300,000 - 500,000"
    },
    {
      id: 2,
      name: "Campus Residence",
      location: "Near College of Engineering",
      description: "Comfortable accommodation with cafeteria and gym",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      availableRooms: 8,
      priceRange: "UGX 280,000 - 450,000"
    },
    {
      id: 3,
      name: "Student Village",
      location: "Ntinda Area",
      description: "Secure student community with parking and common areas",
      image: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400&h=300&fit=crop",
      availableRooms: 15,
      priceRange: "UGX 250,000 - 400,000"
    },
    {
      id: "olympia-hostel-001",
      name: "Olympia Hostel",
      location: "Makerere University Road",
      description: "Premium student accommodation with modern amenities, WiFi, and 24/7 security",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      availableRooms: 10,
      priceRange: "UGX 350,000 - 600,000"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Hero Section */}
      <main className="relative flex flex-col lg:flex-row-reverse justify-center items-center text-gray-900 bg-white px-6 lg:px-20 py-16 pt-24 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-200 animate-gradient-flow"></div>
        
        {/* Hero Illustration - Makerere University Logo */}
        <div className="relative w-[80%] lg:w-[40%] mb-12 lg:mb-0 hidden md:block">
          <img
            src="https://mak.ac.ug/themes/custom/makunika/logo.svg"
            alt="Makerere University Logo"
            className="w-full h-auto animate-float-scale"
          />
        </div>

        {/* Hero Text */}
        <div className="relative text-center lg:text-left max-w-xl animate-fade-in">
          <h1 className="font-serif text-5xl md:text-6xl font-extrabold text-green-700 leading-tight">
            Hostel Management and Booking System
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-600">
            One reliable solution for all your hostel's needs — designed with
            efficiency and simplicity for the Makerere University community.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
            <Link
              to="/auth/login"
              className="bg-green-600 text-white py-3 px-10 rounded-[25px] text-lg font-semibold shadow hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-300 hover:scale-105 animate-glow-pulse"
            >
              Login
            </Link>
            <Link
              to="/auth/request"
              className="border-2 border-green-600 text-green-700 py-3 px-10 rounded-[25px] text-lg font-semibold hover:bg-green-600 hover:text-white focus:ring-4 focus:ring-green-200 transition-all duration-300 hover:scale-105 animate-glow-pulse"
            >
              Request Registration
            </Link>
          </div>
        </div>
      </main>

      {/* Featured Hostels Section */}
      <section className="py-16 bg-gray-50 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Hostels
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our verified hostels. Create an account with your preferred hostel to start booking.
            </p>
          </div>

          {/* Hostels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredHostels.map((hostel) => (
              <div
                key={hostel.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group ${
                  hostel.name === "Olympia Hostel" ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {/* Hostel Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={hostel.image}
                    alt={hostel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 right-4 text-white px-3 py-1 rounded-full text-sm font-semibold ${
                    hostel.name === "Olympia Hostel" ? "bg-blue-600" : "bg-green-600"
                  }`}>
                    {hostel.availableRooms} rooms left
                  </div>
                  {hostel.name === "Olympia Hostel" && (
                    <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                </div>

                {/* Hostel Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {hostel.name}
                  </h3>
                  <p className={`font-semibold mb-2 flex items-center ${
                    hostel.name === "Olympia Hostel" ? "text-blue-600" : "text-green-600"
                  }`}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {hostel.location}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hostel.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className={`font-bold text-lg ${
                      hostel.name === "Olympia Hostel" ? "text-blue-700" : "text-green-700"
                    }`}>
                      {hostel.priceRange}
                    </span>
                    <span className="text-sm text-gray-500">per semester</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link
                      to={`/auth/register?hostel=${hostel.id}`}
                      state={{ selectedHostel: hostel }}
                      className={`text-white text-center py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-colors duration-200 ${
                        hostel.name === "Olympia Hostel" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      Register with {hostel.name}
                    </Link>
                    <Link
                      to={`/hostels/${hostel.id}`}
                      className={`text-center py-2 px-4 rounded-lg font-semibold border hover:bg-gray-50 transition-colors duration-200 ${
                        hostel.name === "Olympia Hostel"
                          ? "text-blue-600 border-blue-600"
                          : "text-green-600 border-green-600"
                      }`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Hostels Link */}
          <div className="text-center mt-12">
            <Link
              to="/hostels"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-lg"
            >
              View All Hostels
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to get your hostel accommodation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Choose Your Hostel
              </h3>
              <p className="text-gray-600">
                Browse through our verified hostels and select the one that suits your preferences and budget.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create Account
              </h3>
              <p className="text-gray-600">
                Register with your chosen hostel by providing your student details and contact information.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Book & Move In
              </h3>
              <p className="text-gray-600">
                Complete your booking, make payments, and get ready to move into your new accommodation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-green-50 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Hostels?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the best student accommodation with our premium features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Environment</h3>
              <p className="text-gray-600 text-sm">24/7 security and CCTV surveillance for your safety</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📶</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High-Speed WiFi</h3>
              <p className="text-gray-600 text-sm">Unlimited internet access for your studies and entertainment</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Comfortable Living</h3>
              <p className="text-gray-600 text-sm">Well-furnished rooms with all necessary amenities</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prime Locations</h3>
              <p className="text-gray-600 text-sm">Strategic locations near campus and essential facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CSS for Animations */}
      <style>
        {`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-flow {
            background-size: 200% 200%;
            animation: gradientFlow 20s linear infinite;
          }
          @keyframes floatScale {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-5px) scale(1.02);
            }
          }
          .animate-float-scale {
            animation: floatScale 5s ease-in-out infinite;
          }
          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
            }
            50% {
              box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
            }
          }
          .animate-glow-pulse {
            animation: glowPulse 3s ease-in-out infinite;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}

export { HeroSection };