// UploadNotes.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../components/AxiosInstance";

// ✅ Constants for dropdowns
// Backend enums from Note model
const COURSES = ["B.Tech", "M.Tech", "Pharma", "BBA", "MBA", "BCom"];

const COURSE_BRANCHES = {
  "B.Tech": [
    "CSE",
    "CSDS",  
    "AI-ML",
    "EX",      // Computer Science & Engineering
    "ECE",         // Electronics & Communication
    "ME",          // Mechanical Engineering
    "CE",          // Civil Engineering
    // "EEE",         // Electrical & Electronics
    "IT",          // Information Technology
    // "Chemical",    // Chemical Engineering
    // "Biotech",     // Biotechnology
    // "Aerospace",   // Aerospace Engineering
    // "Production",  // Production/Industrial Engineering
  ],

  "M.Tech": [
    "CSE", "ECE", "ME", "CE", "EEE", "IT", "Chemical", "Biotech", "Aerospace", "Production",
  ],

  "Pharma": [
    "B.Pharm", 
    "M.Pharm", 
    "Pharma Management", 
    "Clinical Research", 
    "Pharmaceutical Chemistry"
  ],

  "BBA": [
    "General", 
    "Finance", 
    "BA",
    "Marketing", 
    "Human Resource", 
    "International Business"
  ],

  "MBA": [
    "General", 
    "Finance",
    "BA",
    "Marketing", 
    "HR", 
    "Operations", 
    "Pharma Management", 
    "International Business"
  ],

  "BCom": [
    "General", 
    "Honours", 
    "Accounting", 
    "Finance", 
    "Taxation", 
    "Banking & Insurance"
  ],
};

const SEMESTERS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function UploadNotes() {
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!course || !branch || !semester || !subject || !unit || !file) {
      setMessage("⚠ Please fill all fields and select a PDF file.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("⚠ Please login first.");
      return;
    }

    const formData = new FormData();
    formData.append("course", course);
    formData.append("branch", branch);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("unit", unit);
    formData.append("notes_file", file);

    try {
      const response = await axios.post("/notes/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setMessage("✅ Notes uploaded successfully! Waiting for admin approval.");
        setTimeout(() => navigate("/Dashboard"), 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to upload notes. Please try again.");
    }
  };

  return (
    <div className="pt-24 min-h-screen flex justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📤 Upload Notes</h2>
        {message && (
          <p className="mb-4 text-center text-sm font-medium text-red-600">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setBranch(""); // reset branch when course changes
              }}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              <option value="">-- Select Course --</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Dropdown (depends on course) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={!course}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              <option value="">-- Select Branch --</option>
              {course &&
                (COURSE_BRANCHES[course] || []).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              <option value="">-- Select Semester --</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject Name"
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>

          {/* Unit Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. Unit 1, Introduction"
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
