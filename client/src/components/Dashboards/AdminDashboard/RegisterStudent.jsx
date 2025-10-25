import { useState } from "react";
import { Input } from "./Input";
import { Button } from "../Common/PrimaryButton";
import { Loader } from "../Common/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RegisterStudent() {
  const registerStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let student = {
        name: name,
        cms_id: cms,
        room_no: room_no,
        batch: batch,
        dept: dept,
        course: course,
        email: email,
        father_name: fatherName,
        contact: contact,
        address: address,
        dob: dob,
        cnic: cnic,
        hostel: hostel,
        password: password
      };
      const res = await fetch("http://localhost:3000/api/student/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          'Student ' + data.student.name + ' Registered Successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setCms("");
        setName("");
        setRoomNo("");
        setBatch("");
        setDept("");
        setCourse("");
        setEmail("");
        setFatherName("");
        setContact("");
        setAddress("");
        setDob("");
        setCnic("");
        setPassword("");
        setLoading(false);
      } else {
        data.errors.forEach((err) => {
          toast.error(
            err.msg, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            theme: "light",
          });
        });
        setLoading(false);
      }
    } catch (err) {
      toast.error(
        err.message || "Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
      });
      setLoading(false);
    }
  };

  const hostel = JSON.parse(localStorage.getItem("hostel")).name;
  const [cms, setCms] = useState("");
  const [name, setName] = useState("");
  const [room_no, setRoomNo] = useState("");
  const [batch, setBatch] = useState("");
  const [dept, setDept] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white mt-12 py-6">
      <h1 className="text-black font-semibold text-2xl mb-6">Register Student</h1>
      <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-lg ring-2 ring-gray-200">
        <form method="post" onSubmit={registerStudent} className="space-y-5">
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
            <Input
              field={{
                name: "name",
                placeholder: "Name",
                type: "text",
                req: true,
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "cms",
                placeholder: "CMS ID",
                type: "number",
                req: true,
                value: cms,
                onChange: (e) => setCms(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "dob",
                placeholder: "Date of Birth",
                type: "date",
                req: true,
                value: dob,
                onChange: (e) => setDob(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "cnic",
                placeholder: "CNIC",
                type: "text",
                req: true,
                value: cnic,
                onChange: (e) => setCnic(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "email",
                placeholder: "Email",
                type: "email",
                req: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "contact",
                placeholder: "Contact",
                type: "text",
                req: true,
                value: contact,
                onChange: (e) => setContact(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "father_name",
                placeholder: "Father's Name",
                type: "text",
                req: true,
                value: fatherName,
                onChange: (e) => setFatherName(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "room",
                placeholder: "Room Number",
                type: "number",
                req: true,
                value: room_no,
                onChange: (e) => setRoomNo(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "hostel",
                placeholder: "Hostel Name",
                type: "text",
                req: true,
                value: hostel,
                disabled: true,
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "dept",
                placeholder: "Department",
                type: "text",
                req: true,
                value: dept,
                onChange: (e) => setDept(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "course",
                placeholder: "Course",
                type: "text",
                req: true,
                value: course,
                onChange: (e) => setCourse(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "batch",
                placeholder: "Batch",
                type: "number",
                req: true,
                value: batch,
                onChange: (e) => setBatch(e.target.value),
                className: "transition-all"
              }}
            />
            <Input
              field={{
                name: "password",
                placeholder: "Password",
                type: "password",
                req: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "transition-all"
              }}
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block mb-2 text-sm font-medium text-black"
            >
              Address
            </label>
            <textarea
              name="address"
              placeholder="Student Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="2"
              className="border sm:text-sm rounded-lg block w-full p-2 transition-all bg-gray-100 border-gray-300 placeholder-gray-500 text-black focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div className="flex justify-center mt-4">
            <Button className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-all">
              {loading ? (
                <>
                  <Loader /> Registering...
                </>
              ) : (
                <span>Register Student</span>
              )}
            </Button>
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
        </form>
      </div>
    </div>
  );
}

export default RegisterStudent;