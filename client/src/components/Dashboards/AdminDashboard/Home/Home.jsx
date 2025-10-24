import { ShortCard } from "./ShortCard";
import { List } from "./List";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getAllStudents } from "../../../../utils";
import { toast } from "react-toastify";

function Home() {
  const admin = JSON.parse(localStorage.getItem("admin")) || { name: "Admin" };
  const hostel = JSON.parse(localStorage.getItem("hostel")) || { name: "Default Hostel" };

  const [noOfStudents, setNoOfStudents] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [messReqs, setMessReqs] = useState([]);

  const getStudentCount = async () => {
    const res = await getAllStudents();
    if (res.success) {
      setNoOfStudents(res.students.length);
    }
  };

  const getComplaints = async () => {
    try {
      const hostel = JSON.parse(localStorage.getItem("hostel"))._id;
      const response = await fetch(`http://localhost:3000/api/complaint/hostel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostel }),
      });

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints);
      } else {
        toast.error("Failed to fetch complaints", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error("Error fetching complaints: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "light",
      });
    }
  };

  const getSuggestions = async () => {
    try {
      const hostel = JSON.parse(localStorage.getItem("hostel"));
      const response = await fetch(
        "http://localhost:3000/api/suggestion/hostel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hostel: hostel._id }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuggestions(
          data.suggestions.filter((suggestion) => suggestion.status === "pending")
        );
      } else {
        toast.error("Failed to fetch suggestions", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error("Error fetching suggestions: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "light",
      });
    }
  };

  const getRequests = async () => {
    try {
      const hostel = JSON.parse(localStorage.getItem("hostel"));
      const res = await fetch("http://localhost:3000/api/messoff/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostel: hostel._id }),
      });
      const data = await res.json();
      if (data.success) {
        data.list.map((req) => {
          req.id = req._id;
          req.from = new Date(req.leaving_date).toDateString().slice(4, 10);
          req.to = new Date(req.return_date).toDateString().slice(4, 10);
          req._id = req.student._id;
          req.student.name = req.student.name;
          req.student.room_no = req.student.room_no;
          req.status = req.status;
          req.title = `${req.student.name} [ Room: ${req.student.room_no}]`;
          req.desc = `${req.from} to ${req.to}`;
        });
        setMessReqs(data.list);
      } else {
        setMessReqs([]);
        toast.error("Failed to fetch mess requests", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "light",
        });
      }
    } catch (error) {
      setMessReqs([]);
      toast.error("Error fetching mess requests: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "light",
      });
    }
  };

  function transformApiData(apiData) {
    const complaintss = apiData || [];
    const complaintMap = new Map();
    complaintss.forEach(complaint => {
      const date = new Date(complaint.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\.\d{3}/, '');
      complaintMap.set(formattedDate, (complaintMap.get(formattedDate) || 0) + 1);
    });
    const transformedData = Array.from(complaintMap.entries()).map(([date, count]) => ({
      name: date,
      DailyComplaints: count
    }));
    return transformedData;
  }

  useEffect(() => {
    getRequests();
    getStudentCount();
    getComplaints();
    getSuggestions();
  }, []);

  const messIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-black"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
      />
    </svg>
  );

  const suggestionIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-black"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const data = transformApiData(complaints);
  const graph = (
    <ResponsiveContainer
      width="100%"
      height="85%"
      className="bg-white px-5 py-4 rounded-xl shadow-md ring-2 ring-gray-200 w-full max-w-[350px] max-h-96 hover:scale-105 transition-all"
    >
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          bottom: 10,
          left: -20,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <Legend verticalAlign="top" height={24} iconSize={10} fontSize={12} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="DailyComplaints"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white pt-16 pb-8">
      <div className="w-full max-w-6xl px-8">
        <div className="flex flex-col items-center space-y-2 mb-6">
          <h1 className="text-black font-semibold text-4xl text-center">
            Welcome <span className="text-green-600">{admin.name || "admin"}!</span>
          </h1>
          <h2 className="text-gray-700 text-lg">Manager, {hostel.name || "hostel"}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <ShortCard title="Total Students" number={noOfStudents} />
          <ShortCard title="Total Complaints" number={complaints.length} />
          <ShortCard title="Total Suggestions" number={suggestions.length} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <List list={messReqs} title="mess" icon={messIcon} />
          {graph}
          <List list={suggestions} title="suggestions" icon={suggestionIcon} />
        </div>
      </div>
    </div>
  );
}

export default Home;