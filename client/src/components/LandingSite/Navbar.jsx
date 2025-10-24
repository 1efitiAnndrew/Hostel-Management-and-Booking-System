import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md w-full px-6 md:px-16 py-4 flex justify-between items-center text-gray-800">
      {/* Logo Section */}
      <Link
        to="/"
        className="flex items-center font-extrabold text-2xl text-green-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8 mr-2 text-green-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
          />
        </svg>
        HMS
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-10 items-center font-semibold">
        <Link
          to="/about"
          className="text-gray-700 hover:text-green-600 transition-all"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="text-gray-700 hover:text-green-600 transition-all"
        >
          Contact
        </Link>
        <Link
          to="/auth/request"
          className="text-gray-700 hover:text-green-600 transition-all"
        >
          Request
        </Link>
        <Link
          to="/auth/admin-login"
          className="text-gray-700 hover:text-green-600 transition-all"
        >
          Admin Login
        </Link>
        <Link
          to="/auth/login"
          className="bg-green-600 text-white py-2 px-6 rounded-[25px] hover:bg-green-700 transition font-bold"
        >
          Login
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div
        className="md:hidden cursor-pointer text-gray-800"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-[70px] left-0 w-full bg-white shadow-md flex flex-col items-center py-8 space-y-6 text-gray-800 font-semibold text-lg md:hidden z-50">
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link to="/auth/request" onClick={() => setMenuOpen(false)}>
            Request
          </Link>
          <Link to="/auth/admin-login" onClick={() => setMenuOpen(false)}>
            Admin Login
          </Link>
          <Link
            to="/auth/login"
            onClick={() => setMenuOpen(false)}
            className="bg-green-600 text-white py-3 px-12 rounded-[25px] hover:bg-green-700 transition font-bold"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export { Navbar };
