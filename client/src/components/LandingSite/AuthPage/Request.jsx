import { Input } from "./Input";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function RequestAcc() {
  const register = (event) => {
    event.preventDefault();
    let data = {
      cms_id: inputCms,
    };

    fetch("http://localhost:3000/api/request/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    }).then((response) => {
      if (response.status === 200) {
        alert("Request sent successfully");
      } else {
        response.json().then((data) => {
          alert(data.errors[0].msg);
        });
      }
    });
  };

  const [inputCms, setInputCms] = useState('');
  const changeCms = (event) => {
    setInputCms(event.target.value);
  };

  const cms = {
    name: "cms",
    type: "number",
    placeholder: "000000",
    req: true,
    onChange: changeCms,
  };

  return (
    <div className="relative w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0 bg-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-200 animate-gradient-flow"></div>
      
      <div className="relative p-3 sm:p-4 space-y-2 md:space-y-3 animate-fade-in">
        <h1 className="text-base md:text-lg font-bold leading-tight tracking-tight text-green-700 text-center">
          Request Account
        </h1>
        <form className="space-y-2 md:space-y-3" onSubmit={register}>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <Input
              field={cms}
              className="pl-10 w-full rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-green-600 focus:ring-2 text-gray-900 text-sm transition-all duration-300 hover:shadow-md animate-glow-pulse"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-white hover:bg-green-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-1.5 text-center bg-green-600 focus:ring-green-200 transition-all duration-300 hover:scale-105 animate-glow-pulse"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 9.269a.75.75 0 011.062-1.062L6 9.876l5.25-5.25a.75.75 0 011.061 0l5.25 5.25a.75.75 0 010 1.061l-5.25 5.25a.75.75 0 01-1.061 0L6 12z"
              />
            </svg>
            Request
          </button>
          <p className="text-[0.65rem] md:text-xs font-light text-gray-600">
            Already have an account?{" "}
            <Link
              to="/auth"
              className="font-medium hover:underline text-green-700 transition-all duration-300"
            >
              Sign In
            </Link>
          </p>
        </form>
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
    </div>
  );
}