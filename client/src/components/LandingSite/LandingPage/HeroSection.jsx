import { Link } from "react-router-dom";

function HeroSection() {
  return (
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
          Hostel Management System
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-gray-600">
          One reliable solution for all your hostel’s needs — designed with
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
        `}
      </style>
    </main>
  );
}

export { HeroSection };