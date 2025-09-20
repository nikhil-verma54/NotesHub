
import React from "react";

export default function NotesGrid({ notes, onView }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mx-4 mt-7 ">
      {notes.map((n) => (
        <article
          key={n.id}
          className="rounded-xl bg-white shadow-md overflow-hidden border border-gray-100 flex flex-col "
        >
          {/* Cover */}
          <div className="bg-gray-100 h-62">
            <img
              src={n.coverImageUrl || "/placeholder-cover.png"}
              alt={n.subject || n.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col">
            <h3 className="text-lg font-semibold tracking-tight text-black">
              {String(n.subject || n.title).toUpperCase()}
            </h3>

            {/* <p className="text-sm text-gray-600 mt-1">@Module: {n.module}</p> */}
            <p className="text-sm text-gray-600">Semester: {n.semester}</p>
            <p className="text-sm text-gray-600">Unit: {n.unit || "-"}</p>

            {n.details ? (
              <p className="text-[15px] text-gray-800 mt-2">{n.details}</p>
            ) : null}

            <p className="text-sm font-semibold text-emerald-700 mt-2">
              By: {n.username || "Unknown"}
            </p>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <a
                    href={n.fileUrl}
                    
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-black text-white px-3 py-2 text-sm hover:bg-gray-900"
                  >
                    View Note
                  </a>
                  <a
                    href={n.fileUrl}
                    download
                    className="inline-flex items-center rounded-lg bg-gray-200 text-gray-900 px-3 py-2 text-sm hover:bg-gray-300"
                  >
                    Download
                  </a>
                </div>
                <time className="text-xs text-gray-500">
                {n.uploaded_at ? new Date(n.uploaded_at).toLocaleDateString() : ""}
                </time>
              </div>

          </div>
        </article>
      ))}
    </div>
  );
}

