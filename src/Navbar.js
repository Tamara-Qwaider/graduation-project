import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="flex justify-center gap-10 mb-12 mt-2">
      <Link
        to="/home"
        className={`cursor-pointer font-bold text-[18px] tracking-wide text-white ${
          location.pathname === "/home"
            ? "border-b-[3px] border-[#e66000] pb-1"
            : "opacity-70 hover:opacity-100"
        }`}
      >
        Home
      </Link>

      <Link
        to="/meetups"
        className={`cursor-pointer font-bold text-[18px] tracking-wide text-white ${
          location.pathname === "/meetups"
            ? "border-b-[3px] border-[#e66000] pb-1"
            : "opacity-70 hover:opacity-100"
        }`}
      >
        Meetups
      </Link>

      <Link
        to="/activity"
        className={`cursor-pointer font-bold text-[18px] tracking-wide text-white ${
          location.pathname === "/activity"
            ? "border-b-[3px] border-[#e66000] pb-1"
            : "opacity-70 hover:opacity-100"
        }`}
      >
        Activities
      </Link>

      <Link
        to="/profile"
        className={`cursor-pointer font-bold text-[18px] tracking-wide text-white ${
          location.pathname === "/profile"
            ? "border-b-[3px] border-[#e66000] pb-1"
            : "opacity-70 hover:opacity-100"
        }`}
      >
        Profile
      </Link>
    </div>
  );
}