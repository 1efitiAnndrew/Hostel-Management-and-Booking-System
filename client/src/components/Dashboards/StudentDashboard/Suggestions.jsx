import { useState, useEffect } from "react";
import { Input } from "../../LandingSite/AuthPage/Input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const loader = (
  <svg
    aria-hidden="true"
    className="inline w-4 h-4 mr-2 animate-spin text-gray-600 fill-green-600"
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
);

function Suggestions() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);

  // Get student data on component mount
  useEffect(() => {
    const studentData = localStorage.getItem("student");
    if (studentData) {
      try {
        const parsedStudent = JSON.parse(studentData);
        setStudent(parsedStudent);
      } catch (error) {
        console.error("Error parsing student data:", error);
        toast.error("Error loading student data");
      }
    }
  }, []);

  const suggestionTitle = {
    name: "suggestion title",
    placeholder: "Title",
    req: true,
    type: "text",
    value: title,
    onChange: (e) => setTitle(e.target.value),
  };

  const registerSuggestions = async (e) => {
    e.preventDefault();
    
    // Validate student data
    if (!student || !student._id) {
      toast.error("Student information not found. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    // Validate form data
    if (!title.trim() || !desc.trim()) {
      toast.error("Please fill in both title and description", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/suggestion/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          student: student._id, 
          hostel: student.hostel || "", // Provide fallback if hostel is missing
          title: title.trim(), 
          description: desc.trim() 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (data.success) {
        setTitle("");
        setDesc("");
        toast.success("Suggestion registered successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } else {
        toast.error(data.errors?.[0]?.msg || data.message || "Suggestion registration failed", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error registering suggestion: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
    setLoading(false);
  };

  // Show loading or redirect if no student data
  if (!student) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
          <p className="text-sm text-gray-500 mt-2">If this persists, please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col gap-10 items-center justify-center max-h-screen overflow-y-auto bg-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <h1 className="text-black font-bold text-5xl text-center my-6">Suggestions</h1>
        <div className="flex justify-center">
          <form
            method="POST"
            onSubmit={registerSuggestions}
            className="md:w-[30vw] w-full py-5 pb-7 px-10 bg-white rounded-lg shadow-md ring-1 ring-gray-200 flex flex-col gap-5"
          >
            <Input field={suggestionTitle} />
            <div>
              <label
                htmlFor="suggestion"
                className="block mb-2 text-sm font-medium text-black"
              >
                Your suggestion description
              </label>
              <textarea
                name="suggestion"
                placeholder="Suggestions..."
                className="border sm:text-sm rounded-lg block w-full p-2.5 bg-white border-gray-300 placeholder-gray-500 text-black focus:ring-green-600 focus:border-green-600 outline-none"
                onChange={(e) => setDesc(e.target.value)}
                value={desc}
                rows="4"
              ></textarea>
              <button
                type="submit"
                className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 border-2 border-green-600 text-lg rounded-lg px-5 py-2.5 mt-5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !title.trim() || !desc.trim()}
              >
                {loading ? (
                  <div>{loader} Making Suggestion...</div>
                ) : (
                  "Make Suggestion"
                )}
              </button>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Suggestions;