import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaGlobe, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import nikhil from "../assets/bhaishab.jpg";

export default function About() {
  const projects = [
    {
      title: "Placement Tracking System",
      description:
        "A full-stack platform for managing student placements efficiently with dashboards and analytics.",
    },
    {
      title: "E-Commerce Website",
      description:
        "Developed a feature-rich eCommerce site with product filters, cart system, and an admin panel.",
    },
    {
      title: "NotesHub",
      description:
        "Django + React based platform for uploading, approving, and sharing notes seamlessly.",
    },
    {
      title: "Nattrinai",
      description:
        "Django + React based platform for uploading, approving, and sharing notes seamlessly.",
    },
  ];

  return (
    <div className="pt-28 min-h-screen bg-gradient-to-b from-indigo-100 via-white to-purple-100 px-6">
      {/* Header Section */}
      <div className="text-center">
        <img
          src={nikhil}
          alt="Profile"
          className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto shadow-2xl border-4 border-white"
        />
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-6">Nikhil Verma</h1>
        <p className="text-lg md:text-xl text-gray-600 mt-3">
          📚 Student @ Prestige Institute of Management and Research, Bhopal  <br />
          Bachelor of Technology in Computer Science & Engineering
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mt-6 text-2xl md:text-3xl text-gray-700">
          <a href="https://github.com/nikhil-verma54" target="_blank" rel="noreferrer" className="hover:text-black">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/nikhil-verma-a96b302b7" target="_blank" rel="noreferrer" className="hover:text-blue-600">
            <FaLinkedin />
          </a>
          <a href="https://x.com/Nikk_cr?t=FVQXwbO8haTUR-GDVuokUw&s=09" target="_blank" rel="noreferrer" className="hover:text-blue-400">
            <FaTwitter />
          </a>
          <a href="https://www.instagram.com/nikhil.crz/" target="_blank" rel="noreferrer" className="hover:text-pink-500">
            <FaInstagram />
          </a>
          <a href="mailto:nikkcr3141@gmail.com" target="_blank" rel="noreferrer" className="hover:text-gray-500">
            <FaEnvelope/>
          </a>
          <a href="https://wa.me/919131310654" target="_blank" rel="noreferrer" className="hover:text-green-500">
            <FaWhatsapp />
          </a>
        </div>
      </div>

      {/* Journey / Timeline */}
      <div className="mt-16 max-w-5xl mx-auto relative">
        {/* Vertical Line (hidden on small screens) */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-2 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full"></div>

        {projects.map((proj, index) => (
          <div
            key={index}
            className={`mb-16 flex flex-col md:flex-row items-center w-full ${
              index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            {/* Empty space for alignment (desktop only) */}
            <div className="hidden md:block w-1/2"></div>

            {/* Card */}
            <div className="w-full md:w-1/2 px-4 md:px-8">
              <div className="bg-white shadow-2xl rounded-3xl p-6 md:p-10 hover:scale-105 hover:shadow-3xl transition-transform duration-300 border-l-4 md:border-l-8 border-indigo-500">
                <span className="text-base md:text-lg font-semibold text-indigo-600">{proj.year}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 md:mt-3">{proj.title}</h3>
                <p className="text-gray-700 mt-3 md:mt-4 text-base md:text-lg leading-relaxed">
                  {proj.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
