import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "../../Dashboards/Common/Loader";

function Suggestions() {
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const getSuggestions = async () => {
    try {
      setLoading(true);
      const hostel = JSON.parse(localStorage.getItem("hostel"));
      
      if (!hostel || !hostel._id) {
        toast.error("Hostel information not found", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      const response = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/suggestion/hostel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostel: hostel._id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Show all suggestions, not just pending ones
        setSuggestions(data.suggestions || []);
        console.log("Fetched suggestions:", data.suggestions);
      } else {
        toast.error(data.message || "Failed to fetch suggestions", {
          position: "top-right",
          autoClose: 3000,
        });
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Error fetching suggestions: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestion = async (id) => {
    setLoader(true);
    try {
      const response = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/suggestion/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: "approved" }),
      });

      const data = await response.json();
      console.log("Update response:", data);
      
      if (data.success) {
        toast.success("Suggestion Approved", {
          position: "top-right",
          autoClose: 3000,
        });
        // Refresh the suggestions list
        await getSuggestions();
      } else {
        toast.error(data.message || "Failed to update suggestion", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating suggestion:", error);
      toast.error("Error updating suggestion: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setLoader(false);
  };

  const toggleModal = (suggestion = null) => {
    setModalData(suggestion);
    setShowModal(!showModal);
  };

  useEffect(() => {
    getSuggestions();
  }, []);

  // Debug: Log current state
  useEffect(() => {
    console.log("Current suggestions state:", suggestions);
  }, [suggestions]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader />
          <p className="text-black mt-4">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col gap-3 items-center justify-center bg-white p-4">
      <h1 className="text-black font-bold text-5xl mb-4">Suggestions</h1>
      
      {/* Debug Info */}
      <div className="text-sm text-gray-600 mb-4">
        Total Suggestions: {suggestions.length} | 
        Pending: {suggestions.filter(s => s.status === "pending").length} |
        Approved: {suggestions.filter(s => s.status === "approved").length}
      </div>

      <div className="bg-white px-6 py-4 rounded-xl shadow-lg sm:w-[70%] w-full max-w-4xl mt-4 max-h-96 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-black font-bold text-xl">All Suggestions</span>
          <button
            onClick={getSuggestions}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        {showModal && (
          <Modal closeModal={toggleModal} suggestion={modalData} />
        )}

        <ul role="list" className="divide-y divide-gray-200 text-black">
          {suggestions.length === 0 ? (
            <li className="py-4 text-center text-gray-500">
              No suggestions found for your hostel
            </li>
          ) : (
            suggestions.map((suggestion) => (
              <li
                className="py-3 px-4 rounded hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer border border-gray-100 mb-2"
                key={suggestion._id}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-black">
                          {suggestion.title}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <button
                        className="text-blue-500 text-sm underline mt-1"
                        onClick={() => toggleModal(suggestion)}
                      >
                        Read more
                      </button>
                    </div>
                  </div>
                  
                  {suggestion.status === "pending" && (
                    <button 
                      className="group/show relative z-0 ml-4"
                      onClick={() => updateSuggestion(suggestion._id)}
                      disabled={loader}
                    >
                      {loader ? (
                        <Loader />
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 hover:text-green-600 hover:scale-125 transition-all"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
                            />
                          </svg>
                          <span className="text-sm hidden absolute px-2 -right-10 top-6 bg-gray-800 text-white text-center group-hover/show:block rounded">
                            Approve
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
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

export default Suggestions;