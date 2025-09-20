import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navigation() {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("access_token") !== null) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, []);

  return (
    <>
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 text-white px-6 py-4 flex flex-wrap items-center gap-2 justify-between shadow-md"></nav><nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 text-white px-6 py-4 flex flex-wrap items-center gap-2 justify-between shadow-md">

        {/* Brand */}
        <h3 className="text-2xl font-bold">NotesHub</h3>

        {/* Nav Links */}
        <div className="flex-1 flex justify-start space-x-10 ml-10">
          <Link to="/" className="hover:text-gray-300 transition duration-200">
            Home
          </Link>
          <Link
            to="/About"
            className="hover:text-gray-300 transition duration-200"
          >
            Meet Developer
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm mx-4">
          <form
            role="search"
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              const query = typeof q === 'string' ? q.trim() : '';
              if (!query) {
                navigate(`/`);
              } else {
                navigate(`/?q=${encodeURIComponent(query)}`);
              }
            }}
          >
            <label htmlFor="navbar-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <input
                id="navbar-search"
                name="q"
                type="search"
                placeholder="Search notes, subjects..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (!v) {
                    navigate('/');
                  }
                }}
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
          </form>
        </div>

        {/* Buttons (except Ask Doubt) */}
        <div className="flex items-center space-x-4">
          <Link
            to="/UploadNotes"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ⬆ Upload
          </Link>

          
            {/* <Link
              to="/logout"
              className="bg-red-600 px-4 py-1 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Logout
            </Link> */}
          

          {isAuth ? (
            <Link
              to="/Dashboard"
              className="inline-flex h-9 w-9 pt-1 mitems-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:text-blue-600 hover:cursor-pointer"
              aria-label="Profile"
            >
              👤
            </Link>
          ) : (
            <Link
              to="/Auth"
              className="bg-blue-600 px-4 py-1 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Ask Doubt Button - fixed bottom-right */}
      <Link
        to="/ask-doubt"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 pl-2 py-3 text-base font-semibold text-white shadow-lg animate-bounce hover:brightness-110 z-50"
      >
       <p>  Ask Doubt❓</p>  
      </Link>
    </>
  );
}

 
