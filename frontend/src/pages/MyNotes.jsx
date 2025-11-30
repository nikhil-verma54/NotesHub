import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../components/AxiosInstance";

export default function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("⚠ Please login first.");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      fetchNotes(token);
    }
  }, [navigate]);

  const fetchNotes = async (token) => {
    try {
      const { data } = await axios.get("/notes/my-notes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error.response || error.message);
      setMessage("❌ Failed to fetch notes. Please login again.");
      // setTimeout(() => navigate("/login"), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("⚠ Please login first.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await axios.delete(`/notes/delete/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Delete failed:", error.response || error.message);
      setMessage("❌ Failed to delete note. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-20">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📑 My Notes
        </h2>

        {message && (
          <p className="mb-4 text-center text-sm font-medium text-red-600">
            {message}
          </p>
        )}

        {notes.length === 0 ? (
          <p className="text-center text-gray-600">
            You have no notes uploaded.
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold">{note.subject}</h3>
                <p>
                  <strong>Course:</strong> {note.course}
                </p>
                <p>
                  <strong>Branch:</strong> {note.branch}
                </p>
                <p>
                  <strong>Semester:</strong> {note.semester}
                </p>

                {/* Open in same tab */}
                <a
                  href={note.notes_file}
                  className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  📂 Open Note
                </a>

                <button
                  onClick={() => handleDelete(note.id)}
                  className="ml-3 mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
