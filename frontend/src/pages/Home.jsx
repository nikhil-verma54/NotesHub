// Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import NotesGrid from "../components/NotesGrid";
import FilterBar from "../components/FilterBar";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const apiParams = useMemo(() => {
    const params = {};
    const keys = ["q", "course", "branch", "semester", "subject"];
    keys.forEach((k) => {
      const v = queryParams.get(k);
      if (v) params[k] = v;
    });
    return params;
  }, [queryParams]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/notes/list/", {
          params: apiParams,
        });
        setNotes(response.data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      }
    };

    fetchNotes();
  }, [apiParams]);

  return (
    <div className="pt-30 sm:pt-24 ">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Available Notes</h1>
      <FilterBar />
      {Array.isArray(notes) && notes.length > 0 ? (
        <NotesGrid
          notes={notes}
          onView={(id) => window.location.href = `/notes/${id}`}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <div className="py-12 text-center text-gray-600">
          <p className="text-lg font-medium">No similar subjects. Try other keywords or filters.</p>
        </div>
      )}
    </div>
  );
}
