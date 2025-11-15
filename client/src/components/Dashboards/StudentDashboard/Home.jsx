import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { toast } from "react-toastify";

const student = JSON.parse(localStorage.getItem("student")) || { name: "Student" };

const pendingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8 text-black"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const paidIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8 text-black"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

function List() {
  const [invoiceList, setInvoiceList] = useState([
    {
      title: "Mess bill",
      date: "20-5-2025",
      amount: "UGX. 130000",
      status: "pending",
    },
    {
      title: "Mess bill",
      date: "20-5-2025",
      amount: "UGX. 140000",
      status: "pending",
    },
  ]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/invoice/student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student: student._id }),
        });
        const data = await res.json();
        if (data.success) {
          const list = data.invoices
            .filter((invoice) => invoice.status.toLowerCase() === "pending")
            .map((invoice) => {
              const date = new Date(invoice.date);
              return {
                title: invoice.title,
                amount: "Rs. " + invoice.amount,
                status: invoice.status,
                date: date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              };
            });
          setInvoiceList(list);
        } else {
          toast.error("Failed to fetch invoices", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            theme: "light",
          });
        }
      } catch (error) {
        toast.error("Error fetching invoices: " + (error.message || "Something went wrong"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "light",
        });
      }
    };

    fetchInvoices();
  }, []); // Removed invoiceList.length to prevent infinite loops

  return (
    <div className="w-full max-w-[350px] p-4 bg-white rounded-lg shadow-md ring-2 ring-gray-200 max-h-96 overflow-y-auto hover:scale-105 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-bold text-black">Unpaid Invoices</h5>
      </div>
      <div className="flow-root">
        <ul role="list" className="divide-y divide-gray-200">
          {invoiceList.map((invoice, index) => (
            <li key={index} className="py-3">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {invoice.status.toLowerCase() === "pending" ? pendingIcon : paidIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{invoice.title}</p>
                  <p className="text-sm text-gray-500 truncate">{invoice.date}</p>
                </div>
                <div className="text-base font-semibold text-black">{invoice.amount}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Home() {
  const [daysOff, setDaysOff] = useState(0);

  const getAttendance = async () => {
    try {
      const res = await fetch("https://hostel-management-and-booking-systems.onrender.com/api/attendance/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student: student._id }),
      });
      const data = await res.json();
      if (data.success) {
        const daysOff = data.attendance.filter((day) => day.status === "absent").length;
        setDaysOff(daysOff);
      } else {
        toast.error("Failed to fetch attendance", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error("Error fetching attendance: " + (error.message || "Something went wrong"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "light",
      });
    }
  };

  useEffect(() => {
    getAttendance();
  }, []);

  const labels = ["Days off", "Days present"];
  const totalDays = new Date().getDate();
  const chartData = {
    labels,
    datasets: [
      {
        label: "Days",
        data: [daysOff, totalDays - daysOff],
        backgroundColor: ["#10b981", "#6ee7b7"],
        borderColor: ["#10b981", "#6ee7b7"],
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white pt-16 pb-8">
      <div className="w-full max-w-6xl px-8">
        <div className="flex flex-col items-center space-y-2 mb-6">
          <h1 className="text-black font-semibold text-4xl text-center">
            Welcome <span className="text-green-600">{student.name}!</span>
          </h1>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <List />
          <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md ring-2 ring-gray-200 max-w-[350px] max-h-96 hover:scale-105 transition-all">
            <span className="text-black text-lg font-medium mb-4">Attendance</span>
            <Doughnut datasetIdKey="id" data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;