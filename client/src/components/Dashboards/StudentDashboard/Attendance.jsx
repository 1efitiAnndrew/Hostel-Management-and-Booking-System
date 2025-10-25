import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const student = JSON.parse(localStorage.getItem("student")) || { _id: "", name: "Student" };

const presentIcon = (
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

const absentIcon = (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

function Attendance() {
  const [totalDays, setTotalDays] = useState(0);
  const [daysOff, setDaysOff] = useState(0);
  const [thisWeek, setThisWeek] = useState([]);

  const getAttendance = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/attendance/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student: student._id }),
      });
      const data = await res.json();
      if (data.success) {
        let daysOff = 0;
        let thisWeek = [];
        data.attendance.forEach((day) => {
          if (day.status === "absent") {
            daysOff++;
          }
          if (new Date(day.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            thisWeek.push({
              weekdate: new Date(day.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              weekday: new Date(day.date).toLocaleDateString("en-PK", { weekday: "long" }),
              present: day.status === "present",
            });
          }
        });
        setDaysOff(daysOff);
        setThisWeek(thisWeek);
        setTotalDays(data.attendance.length);
      } else {
        toast.error("Failed to fetch attendance data", {
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
      toast.error("Error fetching attendance: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
      });
    }
  };

  useEffect(() => {
    getAttendance();
  }, []); // Removed daysOff.length, thisWeek.length to prevent infinite loops

  const labels = ["Days off", "Days present"];
  const chartData = {
    labels,
    datasets: [
      {
        label: "days",
        data: [daysOff, totalDays - daysOff],
        backgroundColor: ["#10b981", "#6ee7b7"],
        borderColor: ["#10b981", "#6ee7b7"],
        barThickness: 40,
        borderRadius: 5,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="w-full h-screen flex flex-col gap-5 items-center justify-center max-h-screen overflow-y-auto pt-20 md:pt-0 bg-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <h1 className="text-black font-bold text-5xl text-center">Attendance</h1>
        <ul className="flex flex-col sm:flex-row gap-4 text-black text-xl px-5 sm:p-0 text-center my-6">
          <li>Total Days: {totalDays}</li>
          <li>Present Days: {totalDays - daysOff}</li>
          <li>Absent Days: {daysOff}</li>
        </ul>
        <div className="flex gap-5 flex-wrap max-h-96 justify-center items-center">
          <Doughnut datasetIdKey="id" data={chartData} />
          <div className="flow-root bg-white rounded-lg shadow-md w-full mx-5 sm:m-0 sm:w-80 p-5 ring-1 ring-gray-200">
            <p className="text-black text-xl font-bold">This Week</p>
            <ul role="list" className="divide-y divide-gray-200">
              {thisWeek.map((day) => (
                <li key={day.weekdate} className="py-3 sm:py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-black">
                        {day.weekday} -- {day.weekdate}
                      </p>
                      <p className="text-sm truncate text-gray-500">{day.present ? "Present" : "Absent"}</p>
                    </div>
                    <div className="flex flex-col items-center text-base font-semibold text-black">
                      {day.present ? presentIcon : absentIcon}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;