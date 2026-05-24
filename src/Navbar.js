import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar({ unreadMessages = 0 }) {
  const location = useLocation();
  const [storedUnread, setStoredUnread] = useState(0);
  const fetchUnreadFromBackend = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;

    if (!userId) return;

    const res = await axios.get(
      `http://localhost:5000/api/messages/unread/${userId}`
    );

    const counts = res.data || {};

    localStorage.setItem("unreadChatCounts", JSON.stringify(counts));

    const total = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    setStoredUnread(total);
  } catch (err) {
    console.error("Navbar unread error:", err);
  }
};

useEffect(() => {
  const updateUnread = () => {
    const saved = localStorage.getItem("unreadChatCounts");
    const counts = saved ? JSON.parse(saved) : {};

    const total = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    setStoredUnread(total);
  };

  updateUnread();
  fetchUnreadFromBackend();

  window.addEventListener("storage", updateUnread);
  window.addEventListener("unreadChatUpdated", updateUnread);

  return () => {
    window.removeEventListener("storage", updateUnread);
    window.removeEventListener("unreadChatUpdated", updateUnread);
  };
}, []);
const badgeCount = storedUnread;

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
        className={`relative cursor-pointer font-bold text-[18px] tracking-wide text-white ${
          location.pathname === "/activity"
            ? "border-b-[3px] border-[#e66000] pb-1"
            : "opacity-70 hover:opacity-100"
        }`}
      >
        Activities

        {badgeCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-10px",
              right: "-18px",
              background: "#ff2d55",
              color: "white",
              minWidth: "20px",
              height: "20px",
              padding: "0 6px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: "900",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(255, 45, 85, 0.7)",
            }}
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
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