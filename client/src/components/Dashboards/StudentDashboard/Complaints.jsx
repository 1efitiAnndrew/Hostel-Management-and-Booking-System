import { useEffect, useState } from "react";
import { Input } from "../../LandingSite/AuthPage/Input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const student = JSON.parse(localStorage.getItem("student")) || { _id: "", name: "Student", hostel: "" };
const types = ["Electric", "Furniture", "Cleaning", "Others"];

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

const pendingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-7 h-7 text-green-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    />
  </svg>
);

const resolvedIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-green-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

function Complaints() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Electric");
  const [regComplaints, setRegComplaints] = useState([]);

  const titleChange = (e) => setTitle(e.target.value);
  const descChange = (e) => setDesc(e.target.value);
  const chngType = (e) => setType(e.target.value);

  const complaintTitle = {
    name: "complaint title",
    placeholder: "Title",
    req: true,
    type: "text",
    value: title,
    onChange: titleChange,
  };

  const complaintType = {
    name: "complaint type",
    placeholder: "Type...",
    req: true,
    type: "text",
    value: type,
    onChange: chngType,
  };

  const registerComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const complaint = {
        student: student._id,
        hostel: student.hostel,
        title,
        description: desc,
        type,
      };
      const res = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/complaint/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaint),
      });
      const data = await res.json();
      if (data.success) {
        setRegComplaints([]); // Clear to trigger useEffect
        setTitle("");
        setDesc("");
        setType("Electric");
        toast.success("Complaint Registered Successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } else {
        toast.error(data.errors?.[0]?.msg || "Failed to register complaint", {
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
      toast.error("Error registering complaint: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const cmpln = { student: student._id };
        const res = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/complaint/student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cmpln),
        });
        const data = await res.json();
        if (data.success) {
          const complaints = data.complaints.map((complaint) => {
            const date = new Date(complaint.date);
            return {
              title: complaint.title,
              status: complaint.status,
              date: date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
              type: complaint.type,
            };
          });
          setRegComplaints(complaints);
        } else {
          toast.error("Failed to fetch complaints", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            theme: "light",
          });
        }
      } catch (error) {
        toast.error("Error fetching complaints: " + (error.message || "Something went wrong"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          theme: "light",
        });
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col gap-10 items-center justify-center max-h-screen overflow-y-auto pt-80 md:pt-80 lg:p-0 bg-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <h1 className="text-black font-bold text-5xl text-center my-6">Complaints</h1>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <div className="flex justify-center">
            <form
              method="POST"
              onSubmit={registerComplaint}
              className="md:w-96 w-full py-5 pb-7 px-10 bg-white rounded-lg shadow-md ring-1 ring-gray-200 flex flex-col gap-5"
            >
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-black">
                  Your complaint type
                </label>
                <select
                  className="border sm:text-sm rounded-lg block w-full p-2.5 bg-white border-gray-300 placeholder-gray-500 text-black focus:ring-green-600 focus:border-green-600 outline-none"
                  onChange={chngType}
                  value={type}
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {type.toLowerCase() === "electric" || type.toLowerCase() === "furniture" || type.toLowerCase() === "cleaning" ? null : (
                  <div className="mt-5">
                    <Input field={complaintType} />
                  </div>
                )}
              </div>
              <Input field={complaintTitle} />
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-black">
                  Your complaint description
                </label>
                <textarea
                  name="description"
                  placeholder="Details of complaint"
                  className="border sm:text-sm rounded-lg block w-full p-2.5 bg-white border-gray-300 placeholder-gray-500 text-black focus:ring-green-600 focus:border-green-600 outline-none"
                  onChange={descChange}
                  value={desc}
                ></textarea>
                <button
                  type="submit"
                  className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 border-2 border-green-600 text-lg rounded-lg px-5 py-2.5 mt-5 text-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div>{loader} Registering Complaint...</div>
                  ) : (
                    "Register Complaint"
                  )}
                </button>
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
            </form>
          </div>
          <div className="flex justify-center">
            <div className="w-full md:w-80 max-w-md max-h-96 p-4 bg-white border border-gray-300 rounded-lg shadow-md drop-shadow-xl overflow-y-auto ring-1 ring-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xl font-bold leading-none text-black">Registered Complaints</h5>
              </div>
              <div className="flow-root">
                <ul role="list" className="divide-y divide-gray-200 text-black">
                  {regComplaints.length === 0 ? (
                    <li className="py-3 text-sm text-gray-500">No complaints registered</li>
                  ) : (
                    regComplaints.map((complain, index) => (
                      <li key={index} className="py-3 sm:py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {complain.status.toLowerCase() === "pending" ? pendingIcon : resolvedIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-black">{complain.title}</p>
                            <p className="text-sm truncate text-gray-500">{complain.date}</p>
                          </div>
                          <div className="flex flex-col items-center text-base font-semibold text-black">
                            {complain.type}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Complaints;