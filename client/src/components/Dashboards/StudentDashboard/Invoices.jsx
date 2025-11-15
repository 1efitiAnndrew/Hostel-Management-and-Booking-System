import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const student = JSON.parse(localStorage.getItem("student")) || { _id: "", name: "Student" };

const pendingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8 text-green-600"
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
    className="w-8 h-8 text-green-600"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

function Invoices() {
  const [invoiceList, setInvoiceList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);

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
          let paidInvoices = 0;
          let pendingInvoices = 0;
          const list = data.invoices.map((invoice) => {
            if (invoice.status.toLowerCase() === "paid") {
              paidInvoices += 1;
            } else {
              pendingInvoices += 1;
            }
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
          setTotalInvoices(data.invoices.length);
          setPaidInvoices(paidInvoices);
          setPendingInvoices(pendingInvoices);
        } else {
          toast.error("Failed to fetch invoices", {
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
        toast.error("Error fetching invoices: " + (error.message || "Something went wrong"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          theme: "light",
        });
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col gap-5 items-center justify-center max-h-screen overflow-y-auto bg-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <h1 className="text-black font-bold text-5xl text-center">Invoices</h1>
        <p className="text-black text-xl text-center px-5 sm:p-0 mt-2">
          All the invoices like Mess bills, Hostel fee will be shown here
        </p>
        <div className="flex justify-center my-5">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 ml-2 text-5xl font-extrabold text-green-600">{totalInvoices}</dt>
              <dd className="text-gray-500 text-center">Total Invoices</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-5xl font-extrabold text-green-600">{paidInvoices}</dt>
              <dd className="text-gray-500">Paid Invoices</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-5xl font-extrabold text-green-600">{pendingInvoices}</dt>
              <dd className="text-gray-500">Pending Invoices</dd>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-md p-4 bg-white border border-gray-300 rounded-lg shadow-md drop-shadow-xl overflow-y-auto max-h-70 ring-1 ring-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xl font-bold leading-none text-black">Latest Invoices</h5>
            </div>
            <div className="flow-root">
              <ul role="list" className="divide-y divide-gray-200">
                {invoiceList.length === 0 ? (
                  <li className="py-3 text-sm text-gray-500">No invoices available</li>
                ) : (
                  invoiceList.map((invoice, index) => (
                    <li key={index} className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {invoice.status.toLowerCase() === "pending" ? pendingIcon : paidIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-black">{invoice.title}</p>
                          <p className="text-sm truncate text-gray-500">{invoice.date}</p>
                        </div>
                        <div className="flex flex-col items-center text-base font-semibold text-black">
                          {invoice.amount}
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
  );
}

export default Invoices;