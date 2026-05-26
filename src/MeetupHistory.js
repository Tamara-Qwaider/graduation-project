import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ActivityPage.css";

export default function MeetupHistory() {
  const [historyMeetups, setHistoryMeetups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openParticipantsId, setOpenParticipantsId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userName = user?.name;

        if (!userName) return;

        const res = await axios.get(
          `http://localhost:5000/api/meetups/history/${userName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHistoryMeetups(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("History error:", err);
      }
    };

    fetchHistory();
    const fetchUsers = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAllUsers(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Users error:", err);
  }
};

fetchUsers();
  }, [user?.name, token]);

  const fetchMessages = async (meetupId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/messages/${meetupId}`
      );

      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Messages error:", err);
    }
  };

  return (
    <div className="activity-page-bg">

      <main className="activity-main">
        <section className="activity-section">
          <button
             onClick={() => navigate("/profile")}
             style={{
                    position: "absolute",
                    top: "30px",
                    left: "30px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    fontSize: "34px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.25s ease",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.12)";
                    e.currentTarget.style.boxShadow =
                        "0 0 25px rgba(255,255,255,0.35)";
                        e.currentTarget.style.background =
                            "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(0,0,0,0.25)";
                        e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                }}
            >
              ←
            </button>
            <div
              style={{
                textAlign: "center",
                marginBottom: "40px",
                marginTop: "20px",
              }}
            >
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "800",
                  color: "white",
                  marginBottom: "12px",
                  letterSpacing: "1px",
                }}
              >
                 Meetup History
              </h1>

              <div
                style={{
                 width: "140px",
                  height: "4px",
                  margin: "0 auto",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(to right, #e66000, #ff8a00)",
                    boxShadow: "0 0 18px rgba(255,138,0,0.5)",
                }}
              />
              </div>

          <div style={{display: "grid",gridTemplateColumns: "repeat(3, 1fr)",gap: "22px",alignItems: "stretch", }}>
            {historyMeetups.length > 0 ? (
              historyMeetups.map((meetup) => (
                <div key={meetup._id} className="activity-card"style={{height: "100%",minHeight: "240px",}}>
                  <div className="activity-card-left-icon">
                    {meetup.icon || "🕘"}
                  </div>

                  <div className="activity-card-content">
                    <h4 style={{fontSize: "20px",fontWeight: "800",marginBottom: "10px",color: "white",}}>
                        {meetup.title}
                    </h4>

                    <p>
                      Hosted by{" "}
                      {typeof meetup.createdBy === "string"
                        ? meetup.createdBy
                        : meetup.createdBy?.name || "System"}
                    </p>

                    <div className="activity-meta">
                      <span>
                        📅 {new Date(meetup.date).toLocaleDateString()}{" "}
                        {meetup.time ? `• ${meetup.time}` : ""}
                      </span>

                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenParticipantsId(
                            openParticipantsId === meetup._id ? null : meetup._id
                          );
                        }}
                        style={{
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        👥 {meetup.attendees?.length || 0} people
                      </span>
                    </div>
                    {openParticipantsId === meetup._id && (
                    <div
                      className="activity-participants-scroll"
                      style={{
                         marginTop: "10px",
                          padding: "10px",
                          borderRadius: "14px",
                          background: "rgba(15, 23, 42, 0.92)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                          maxHeight: "160px",
                          overflowY: "auto",
                          scrollbarWidth: "thin",
                          scrollbarColor: "#3b1d63 transparent",
                       }}
                    >
                      {(meetup.attendees || []).map((person, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "7px 8px",
                            color: "white",
                            fontSize: "13px",
                            borderBottom:
                            index !== meetup.attendees.length - 1
                            ? "1px solid rgba(255,255,255,0.08)"
                            : "none",
                          }}
                        >
                          <span
                            onClick={() => {
                              const matchedUser = allUsers.find((u) => u.name === person);
                              const id = matchedUser?._id || matchedUser?.id;

                              if (id) navigate(`/profile/${id}`);
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            👤 {person}
                          </span>
                        </div>
                      ))}
                   </div>
                  )}

                    <div className="activity-card-actions">
                      <button
                        className="details-btn"
                        onClick={() => {
                          setSelectedMeetup(meetup);
                          setIsChatOpen(true);
                          fetchMessages(meetup._id);
                        }}
                      >
                        View Chat 💬
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-text">No ended meetups yet.</p>
            )}
          </div>
        </section>

        {isChatOpen && selectedMeetup && (
          <div
            className="activity-popup-overlay"
            onClick={() => setIsChatOpen(false)}
          >
            <div
              className="activity-popup-box"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="activity-popup-close"
                onClick={() => setIsChatOpen(false)}
              >
                ✕
              </button>

              <div className="activity-popup-header">
                <div className="activity-popup-icon">📜</div>
                <h2>{selectedMeetup.title}</h2>
                <p>READ-ONLY CHAT HISTORY</p>
              </div>

              <div className="chat-messages-box">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`chat-message ${
                        msg.senderName === user?.name ? "mine" : ""
                      }`}
                    >
                      <strong className="chat-user-name">
                        {msg.senderName}
                      </strong>

                      <p>{msg.text}</p>

                      <div className="chat-message-footer">
                        <small className="chat-time">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">No messages in this meetup.</p>
                )}
              </div>

              <p className="empty-text">
                This chat is read-only because the meetup has ended.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}