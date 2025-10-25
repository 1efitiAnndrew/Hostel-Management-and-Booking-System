import { Input } from "./Input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { verifysession } from "../../../utils/";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader } from "../../Dashboards/Common/Loader";

export default function SignIn() {
  let navigate = useNavigate();

  if (localStorage.getItem("token")) {
    verifysession();
  }

  let login = async (event) => {
    event.preventDefault();
    setLoader(true);
    let data = {
      email: email,
      password: pass,
    };

    let response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    let result = await response.json();

    if (result.success) {
      localStorage.setItem("token", result.data.token);
      let student = await fetch("http://localhost:3000/api/student/get-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAdmin: result.data.user.isAdmin,
          token: result.data.token})
      });

      let studentResult = await student.json();
      if (studentResult.success) {
        localStorage.setItem("student", JSON.stringify(studentResult.student));
        navigate("/student-dashboard");
      } else {
        // console.log(studentResult.errors)
      }
    } else {
      toast.error(
        result.errors[0].msg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
    }
    setLoader(false);
  };

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loader, setLoader] = useState(false);

  const changeEmail = (event) => {
    setEmail(event.target.value);
  };
  const changePass = (event) => {
    setPass(event.target.value);
  };

  const iemail = {
    name: "email",
    type: "email",
    placeholder: "abc@gmail.com",
    req: true,
    onChange: changeEmail,
  };
  const password = {
    name: "password",
    type: "password",
    placeholder: "••••••••",
    req: true,
    onChange: changePass,
  };

  return (
    <div className="relative w-full rounded-lg md:mt-0 sm:max-w-md xl:p-0 bg-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-200 animate-gradient-flow"></div>
      
      <div className="relative p-4 sm:p-6 space-y-3 md:space-y-4 animate-fade-in">
        <h1 className="text-lg md:text-xl font-bold leading-tight tracking-tight text-green-700 text-center">
          Student Sign In
        </h1>
        <form className="space-y-3 md:space-y-4" onSubmit={login}>
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
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <Input
              field={iemail}
              className="pl-10 w-full rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-green-600 focus:ring-2 text-gray-900 text-sm transition-all duration-300 hover:shadow-md animate-glow-pulse"
            />
          </div>
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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <Input
              field={password}
              className="pl-10 w-full rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-green-600 focus:ring-2 text-gray-900 text-sm transition-all duration-300 hover:shadow-md animate-glow-pulse"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="remember"
                  aria-describedby="remember"
                  type="checkbox"
                  className="w-4 h-4 border rounded focus:ring-3 bg-white border-gray-300 focus:ring-green-600 ring-offset-white text-green-600"
                  required=""
                />
              </div>
              <div className="ml-3 text-xs md:text-sm">
                <label htmlFor="remember" className="text-gray-600">
                  Remember me
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2 text-center bg-green-600 hover:bg-green-700 focus:ring-green-200 transition-all duration-300 hover:scale-105 animate-glow-pulse"
          >
            {loader ? (
              <>
                <Loader /> Verifying...
              </>
            ) : (
              <>
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
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                Sign in
              </>
            )}
          </button>
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
          <p className="text-xs md:text-sm font-light text-gray-600">
            Don’t have an account yet?{" "}
            <Link
              to="/auth/request"
              className="font-medium hover:underline text-green-700 transition-all duration-300"
            >
              Request an account.
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