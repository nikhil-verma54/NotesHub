import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

export default function FilterBar() {
  const navigate = useNavigate();
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);

  // Reset dependencies on change
  useEffect(() => {
    setBranch("");
    setSemester("");
    setSubject("");
  }, [course]);

  useEffect(() => {
    setSemester("");
    setSubject("");
  }, [branch]);

  useEffect(() => {
    setSubject("");
  }, [semester]);

  const reset = () => {
    setCourse("");
    setBranch("");
    setSemester("");
    setSubject("");
    navigate("/");
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (course) params.set("course", course);
    if (branch) params.set("branch", branch);
    if (semester) params.set("semester", semester);
    if (subject) params.set("subject", subject);
    navigate(`/?${params.toString()}`);
  };

  const branches = course ? (COURSE_BRANCHES[course] || []) : [];
  const semesters = SEMESTERS;

  // Fetch subjects dynamically from backend according to uploaded notes
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const params = {};

        // Send filters exactly as backend expects
        if (course) params.course = course;
        if (branch) params.branch = branch;
        if (semester) params.semester = semester;

        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const { data } = await axios.get("http://127.0.0.1:8000/notes/subjects/", { params, headers });
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        setSubjects([]);
      }
    };
    fetchSubjects(); 
  }, [course, branch, semester]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 ">
      <div className="max-w-5xl mx-3  flex items-center ">
              <button
                onClick={() => navigate('/')}
                className="border rounded px-3 py-2 bg-gray-100"
              >
                Show All
              </button>
            </div>
      {/* Course Selector */}
      <select
        className="border rounded px-3 py-2 bg-gray-100"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      >
        <option value="">All Courses</option>
        {COURSES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Branch Selector */}
      <select
        className="border rounded px-3 py-2 bg-gray-100"
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
        disabled={!branches.length}
      >
        <option value="">All Branches</option>
        {branches.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>

      {/* Semester Selector */}
      <select
        className="border rounded px-3 py-2 bg-gray-100"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        disabled={!semesters.length}
      >
        <option value="">Select Semester</option>
        {semesters.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Subject Selector */}
      <select
        className="border rounded px-3 py-2 bg-gray-100"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={!subjects.length}
        size={subjects.length > 6 ? 6 : undefined}
      >
        <option value="">Select Subject</option>
        {subjects.map((sub) => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>

      {/* Apply & Reset Buttons */}
      <button
        className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-500 cursor-pointer"
        onClick={applyFilters}
      >
        Apply
      </button>
      <button
        className="bg-gray-200 text-gray-800 rounded px-4 py-2 hover:bg-gray-300 cursor-pointer"
        onClick={reset}
      >
        Reset
      </button>
    </div>
  );
}
