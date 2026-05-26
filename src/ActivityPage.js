import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./ActivityPage.css";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

/* ==========================================================================
   1. Sub-Components
   ========================================================================== */

const DetailsPopup = ({ isOpen, onClose, activity }) => {
  if (!isOpen || !activity) return null;

  return (
    <div className="activity-popup-overlay" onClick={onClose}>
      <div className="activity-popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="activity-popup-close" onClick={onClose}>
          ✕
        </button>

        <div className="activity-popup-header">
          <div className="activity-popup-icon">{activity.icon || "📍"}</div>
          <h2>{activity.title}</h2>
          <p>ACTIVITY DETAILS</p>
        </div>

        <div className="activity-popup-sections">
          <div className="activity-popup-row">
            <span>📍</span>
            <div>
              <small>Location</small>
              <p>{activity.location}</p>
            </div>
          </div>

          <div className="activity-popup-row">
            <span>📅</span>
            <div>
              <small>Date & Time</small>
              <p>
                {new Date(activity.date).toLocaleDateString()} • {activity.time}
              </p>
            </div>
          </div>

          <div className="activity-popup-row">
            <span>👤</span>
            <div>
              <small>Hosted By</small>
              <p>
                {typeof activity.createdBy === "string"
                  ? activity.createdBy
                  : activity.createdBy?.name || "System"}
              </p>
            </div>
          </div>
        </div>

        <button className="activity-popup-main-btn" onClick={onClose}>
          Close Details
        </button>
      </div>
    </div>
  );
};

const InviteCard = ({
  _id,
  title,
  location,
  createdBy,
  date,
  time,
  attendees,
  onAccept,
  onDeny,
}) => (
  <div className="invite-card">
    <div className="invite-card-top">
      <div className="invite-icon">📍</div>

      <div>
        <h3>{title || location}</h3>
        <p>
          Hosted by{" "}
          {typeof createdBy === "string" ? createdBy : createdBy?.name}
        </p>
      </div>
    </div>

    <div className="invite-details">
      <div>
        <span>Date</span>
        <strong>{new Date(date).toLocaleDateString()}</strong>
      </div>

      <div>
        <span>Time</span>
        <strong>{time}</strong>
      </div>

      <div>
        <span>Attendees</span>
        <strong>{attendees?.length || 0}</strong>
      </div>
    </div>

    <div className="invite-actions">
      <button className="deny-btn" onClick={() => onDeny(_id)}>
        ✕ Ignore
      </button>

      <button className="accept-btn" onClick={() => onAccept(_id)}>
        ✓ Join
      </button>
    </div>
  </div>
);

const ActivityCard = ({
  _id,
  title,
  createdBy,
  date,
  time,
  location,
  attendees,
  icon,
  unreadCount,
  onDetailsClick,
  onLeave,
  onChatClick,
}) => (
  <div className="activity-card">
    {unreadCount > 0 && (
      <div className="chat-unread-badge">
        {unreadCount}
      </div>
    )}
    <div className="activity-card-left-icon">{icon || "⛺"}</div>

    <div className="activity-card-content">
      <h4>{title}</h4>

      <p>
        Hosted by{" "}
        {typeof createdBy === "string" ? createdBy : createdBy?.name}
      </p>

      <div className="activity-meta">
        <span>
          📅 {new Date(date).toLocaleDateString()} {time ? `• ${time}` : ""}
        </span>

        <span>👥 {attendees?.length || 0} people</span>
      </div>

      <div className="activity-card-actions">
        <button
          className="details-btn"
          onClick={() =>
            onDetailsClick({
              _id,
              title,
              icon,
              location,
              date,
              time,
              createdBy,
              attendees,
            })
          }
        >
          Activity Details
        </button>
        <button
          className="details-btn"
          onClick={() =>
            onChatClick({
              _id,
              title,
              location,
              date,
              time,
              createdBy,
              attendees,
            })
          }
        >
         Chat 💬
       </button>

        <button className="leave-btn" onClick={() => onLeave(_id)}>
          Leave Activity
        </button>
      </div>
    </div>
  </div>
);


const NotificationCard = ({ notification, onRead, onDelete }) => (
  <div className="invite-card">
    <div className="invite-card-top">
      <div className="invite-icon">
        {notification.type === "delete" ? "🗑️" : "✏️"}
      </div>

      <div>
        <h3>{notification.meetupTitle}</h3>
        <p>{notification.message}</p>
      </div>
    </div>

    <div className="invite-actions">
      {!notification.isRead && (
        <button className="accept-btn" onClick={() => onRead(notification._id)}>
          ✓ Mark Read
        </button>
      )}

      <button className="deny-btn" onClick={() => onDelete(notification._id)}>
        ✕ Remove
      </button>
    </div>
  </div>
);

const StatCircle = ({ title, items }) => (
  <div className="stat-circle-wrapper">
    <div className="stat-circle">
      <h3>{title}</h3>

      <div className="stat-items">
        {items.map((item, idx) => (
          <div className="stat-row" key={idx}>
            <div className="stat-label">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>

            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  </div>
);


/* ==========================================================================
   2. Main Page Component
   ========================================================================== */

export default function ActivityPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentActivities, setCurrentActivities] = useState([]);
  const [invites, setInvites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [places, setPlaces] = useState([]);
  const [dashboardFocus, setDashboardFocus] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMeetup, setChatMeetup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser?._id || loggedInUser?.id;
  const userName = loggedInUser?.name;
  const token = localStorage.getItem("token");
  const [unreadCounts, setUnreadCounts] = useState(() => {
    const saved = localStorage.getItem(`unreadChatCounts_${userId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dashboardRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);


  const getMeetupDateTime = useCallback((meetup) => {
    if (meetup?.expiresAt) {
      return new Date(meetup.expiresAt);
    }

    if (meetup?.date && meetup?.time) {
      return new Date(`${meetup.date}T${meetup.time}`);
    }

    return null;
  }, []);

  const isMeetupActive = useCallback(
    (meetup) => {
      if (!meetup) return false;

      if (meetup.status === "cancelled" || meetup.status === "expired") {
        return false;
      }

      const meetupDateTime = getMeetupDateTime(meetup);

      if (!meetupDateTime || isNaN(meetupDateTime.getTime())) {
        return true;
      }

      return meetupDateTime > new Date();
    },
    [getMeetupDateTime]
  );

  const fetchPlaces = useCallback(async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/places", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPlaces(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Error fetching places:", err);
  }
}, [token]);

  const fetchRealData = useCallback(async () => {
    try {
      const response = await axios.get(
       "http://localhost:5000/api/meetups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allMeetups = Array.isArray(response.data) ? response.data : [];
      const activeMeetups = allMeetups.filter(isMeetupActive);

      if (!userName) {
        setCurrentActivities([]);
        setInvites([]);
        setDashboardFocus(null);
        return;
      }

      const joined = activeMeetups.filter((m) => {
        return (
          m.createdBy === userName ||
          m.attendees?.includes(userName)
        );
      });

      const targetedInvites = activeMeetups.filter((m) => {
        return (
          m.createdBy !== userName &&
          !m.attendees?.includes(userName) &&
          m.invitedPeople?.includes(userName)
        );
      });

      setCurrentActivities(joined);
      setInvites(targetedInvites);

      if (joined.length > 0 && !dashboardFocus) {
        setDashboardFocus(joined[0]);
      }

      if (joined.length === 0) {
        setDashboardFocus(null);
      }

      if (dashboardFocus && !isMeetupActive(dashboardFocus)) {
        setDashboardFocus(joined[0] || null);
        setSelectedActivity(null);
        setIsPopupOpen(false);
      }
    } catch (err) {
      console.error("Failed to load real activities:", err);
      setCurrentActivities([]);
      setInvites([]);
      toast.error("Failed to load real activities.");
    }
  }, [userName, dashboardFocus, isMeetupActive, token]);

  const fetchNotifications = useCallback(async () => {
    try {
      const userName = loggedInUser?.name;

      if (!userName) {
        setNotifications([]);
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/notifications/${userName}`
      );

      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [loggedInUser?.name]);

  const fetchUnreadCounts = useCallback(async () => {
  try {
    if (!userId) return;

    const res = await axios.get(
      `http://localhost:5000/api/messages/unread/${userId}`
    );

    setUnreadCounts(res.data || {});
  } catch (err) {
    console.error("Error fetching unread counts:", err);
  }
}, [userId]);

  useEffect(() => {
  fetchRealData();
  fetchNotifications();
  fetchPlaces();
}, [fetchRealData, fetchNotifications, fetchPlaces]);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      showEmojiPicker &&
      !e.target.closest(".emoji-picker-wrapper") &&
      !e.target.closest(".emoji-toggle-btn")
    ) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showEmojiPicker]);

useEffect(() => {
  fetchRealData();
  fetchNotifications();
  fetchUnreadCounts();
}, [fetchRealData, fetchNotifications, fetchUnreadCounts]);

  useEffect(() => {
  if (!userId) return;

  localStorage.setItem(
    `unreadChatCounts_${userId}`,
    JSON.stringify(unreadCounts)
  );

  window.dispatchEvent(new Event("unreadChatUpdated"));
}, [unreadCounts, userId]);

  useEffect(() => {
  socketRef.current = io("http://localhost:5000");
  if (chatMeetup?._id) {
  socketRef.current.emit("join_meetup_chat", chatMeetup._id);
}

  socketRef.current.on("new_notification", (notification) => {
  if (notification.userName === loggedInUser?.name) {
    setNotifications((prev) => [notification, ...prev]);
    toast(notification.message);
   }
    });

  socketRef.current.on("receive_meetup_message", (messageData) => {
  setMessages((prev) => {
    const exists = prev.some((msg) => msg._id === messageData._id);

    if (exists) return prev;

    return [...prev, messageData];
  });
  if (
  messageData.meetupId !== chatMeetup?._id &&
  messageData.senderName !== loggedInUser?.name
) {
  setUnreadCounts((prev) => {
    const updated = {
      ...prev,
      [messageData.meetupId]: (prev[messageData.meetupId] || 0) + 1,
    };

    localStorage.setItem(
      `unreadChatCounts_${userId}`,
      JSON.stringify(updated)
    );
    window.dispatchEvent(new Event("unreadChatUpdated"));

    return updated;
  });
}
});
socketRef.current.on("user_typing", (data) => {
  if (
    data.meetupId === chatMeetup?._id &&
    data.userName !== loggedInUser?.name
  ) {
    setTypingUser(data.userName);
  }
});

socketRef.current.on("user_stop_typing", (data) => {
  if (data.meetupId === chatMeetup?._id) {
    setTypingUser("");
  }
});

  return () => {
    socketRef.current.off("new_notification");
    socketRef.current.disconnect();
  };
}, [chatMeetup?._id, loggedInUser?.name, fetchUnreadCounts, userId]);


useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

useEffect(() => {
  if (!chatMeetup) return;

  const meetupDate = getMeetupDateTime(chatMeetup);

  if (!meetupDate) return;

  if (meetupDate <= new Date()) {
    setIsChatOpen(false);
    setChatMeetup(null);
    toast("This meetup has ended.");
  }
}, [chatMeetup, getMeetupDateTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivities((prev) => prev.filter(isMeetupActive));
      setInvites((prev) => prev.filter(isMeetupActive));

      setDashboardFocus((prev) => {
        if (prev && !isMeetupActive(prev)) return null;
        return prev;
      });

      setSelectedActivity((prev) => {
        if (prev && !isMeetupActive(prev)) {
          setIsPopupOpen(false);
          return null;
        }

        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [isMeetupActive]);

  const handleDetailsClick = (activity) => {
    if (!isMeetupActive(activity)) {
      toast.error("This activity has already ended.");
      fetchRealData();
      return;
    }

    setSelectedActivity(activity);
    setIsPopupOpen(true);
    setDashboardFocus(activity);

    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/meetups/${id}/join`,
        {
          userName: loggedInUser.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success("Joined successfully! 🎉");
        fetchRealData();
      }
    } catch (err) {
      console.error("JOIN ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Error joining activity.");
      fetchRealData();
    }
  };

  const handleLeaveActivity = async (id) => {
    const activity = currentActivities.find((m) => m._id === id);

    if (activity?.createdBy === loggedInUser?.name) {
      toast.error("Host cannot leave. Please cancel the meetup instead.");
      return;
    }
    if (!window.confirm("Are you sure you want to leave this activity?")) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/meetups/${id}/leave`,
        {
          userName: loggedInUser.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("You left the activity successfully.");

      if (dashboardFocus?._id === id) {
        setDashboardFocus(null);
      }

      fetchRealData();
    } catch (err) {
      console.error("Error leaving activity:", err);
      toast.error(err.response?.data?.message || "Error leaving activity.");
    }
  };

  const handleDenyInvite = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/meetups/${id}/deny`,
        {
          userName: loggedInUser.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Invite ignored.");
      fetchRealData();
    } catch (err) {
      console.error("Error denying invite:", err);
      toast.error(err.response?.data?.message || "Error ignoring invite.");
    }
  };

  const handleReadNotification = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      toast.error("Error updating notification.");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      toast.error("Error removing notification.");
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const fetchMessages = async (meetupId) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/messages/${meetupId}`);
    setMessages(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
};

const markMessagesAsRead = async (meetupId) => {
  try {
    const userId = loggedInUser?._id || loggedInUser?.id;

    if (!userId) return;

    await axios.put(
      `http://localhost:5000/api/messages/read/${meetupId}`,
      { userId }
    );

    setUnreadCounts((prev) => ({
      ...prev,
      [meetupId]: 0,
    }));

    fetchUnreadCounts();
  } catch (err) {
    console.error("Error marking messages as read:", err);
  }
};
 const handleSendMessage = async () => {
  if (!newMessage.trim() || isSending) return;

  setIsSending(true);

  const messageData = {
    meetupId: chatMeetup._id,
    senderId: loggedInUser?._id || loggedInUser?.id,
    senderName: loggedInUser?.name,
    text: newMessage.trim(),
  };

  try {
    const response = await axios.post(
      "http://localhost:5000/api/messages",
      messageData
    );
    setMessages((prev) => [...prev, response.data]);

    socketRef.current.emit("send_meetup_message", response.data);
    setNewMessage("");
    socketRef.current.emit("stop_typing", {
      meetupId: chatMeetup._id,
    });
    setShowEmojiPicker(false);
  } catch (err) {
    toast.error("Failed to send message.");
  } finally {
    setIsSending(false);
  }
};

const totalUnreadMessages = Object.values(unreadCounts).reduce(
  (sum, count) => sum + count,
  0
);

const dashboardPlace = places.find((place) => {
  const placeName = String(place.name || place.title || "")
    .toLowerCase()
    .trim();

  const meetupLocation = String(dashboardFocus?.location || "")
    .toLowerCase()
    .trim();

  return placeName === meetupLocation;
});

const statsData = [
  {
    title: "Meetup Info",
    items: [
      {
        label: "Meetup Title",
        value: dashboardFocus?.title || "No Plans",
        icon: "👑",
      },
      {
        label: "Confirmed",
        value: dashboardFocus?.attendees?.length || "0",
        icon: "✅",
      },
    ],
  },
  {
    title: "Status",
    items: [
      {
        label: "Date",
        value: dashboardFocus
          ? new Date(dashboardFocus.date).toLocaleDateString()
          : "-",
        icon: "📅",
      },
      {
        label: "Time",
        value: dashboardFocus?.time || "-",
        icon: "⏰",
      },
    ],
  },
  {
    title: "Location Details",
    items: [
      {
        label: "Place Name",
        value:
          dashboardPlace?.name ||
          dashboardPlace?.title ||
          dashboardFocus?.location ||
          "-",
        icon: "🗺️",
      },
      {
        label: "Location",
        value:
          dashboardPlace?.location ||
          dashboardPlace?.loc ||
          dashboardFocus?.location ||
          "-",
        icon: "📍",
      },
      {
        label: "Rating",
        value: dashboardPlace?.rating || dashboardPlace?.rate || "-",
        icon: "⭐",
      },
    ],
  },
];
  return (
    <div className="activity-page-bg">
      <Toaster position="top-center" reverseOrder={false} />

      <DetailsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        activity={selectedActivity}
      />

      <div className="activity-navbar-wrap">
        <Navbar unreadMessages={totalUnreadMessages} />
      </div>

      <main className="activity-main">
        {notifications.length > 0 && (
          <section className="activity-section">
            <h3 className="section-heading">
              Notifications{" "}
              {unreadNotifications.length > 0
                ? `(${unreadNotifications.length} new)`
                : ""}
            </h3>

            <div className="invites-scroll">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onRead={handleReadNotification}
                  onDelete={handleDeleteNotification}
                />
              ))}
            </div>
          </section>
        )}

        <section className="activity-section">
          <h3 className="section-heading">Available Meetups (Invites)</h3>

          <div className="invites-scroll">
            {invites.length > 0 ? (
              invites.map((inv) => (
                <InviteCard
                  key={inv._id}
                  {...inv}
                  onAccept={handleJoin}
                  onDeny={handleDenyInvite}
                />
              ))
            ) : (
              <p className="empty-text">No new meetups found.</p>
            )}
          </div>
        </section>

        <section className="activity-section">
          <h3 className="section-heading">Current Activity</h3>

          <div className="invites-scroll">
            {currentActivities.length > 0 ? (
              currentActivities.map((act) => (
                <ActivityCard
                  key={act._id}
                  {...act}
                  unreadCount={unreadCounts[act._id] || 0}
                  onDetailsClick={handleDetailsClick}
                  onLeave={handleLeaveActivity}
                  onChatClick={(activity) => {
                    setChatMeetup(activity);
                    setIsChatOpen(true);
                    setUnreadCounts((prev) => ({
                      ...prev,
                      [activity._id]: 0,
                    }));
                    fetchMessages(activity._id);
                    markMessagesAsRead(activity._id);
                  }}
                />
              ))
            ) : (
              <p className="empty-text">
                Your schedule is empty. Join an activity!
              </p>
            )}
          </div>
        </section>

        <section className="activity-section" ref={dashboardRef}>
          <h3 className="section-heading centered">Dashboard Overview</h3>

          <div className="stats-scroll">
            {statsData.map((stat, index) => (
              <StatCircle key={index} title={stat.title} items={stat.items} />
            ))}
          </div>
        </section>
        {isChatOpen && chatMeetup && (
          <div className="activity-popup-overlay" onClick={() => setIsChatOpen(false)}>
            <div className="activity-popup-box" onClick={(e) => e.stopPropagation()}>
              <button className="activity-popup-close" onClick={() => setIsChatOpen(false)}>
                ✕
              </button>

              <div className="activity-popup-header">
                <div className="activity-popup-icon">💬</div>
                <h2>{chatMeetup.title}</h2>
                <p>MEETUP CHAT</p>
              </div>

              <div className="chat-messages-box">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-message ${
                        msg.senderName === loggedInUser?.name ? "mine" : ""
                      }`}
                    >
                      <strong
                        className="chat-user-name"
                        onClick={() => {
                          if (msg.senderId) {
                            window.location.href = `/profile/${msg.senderId}`;
                          }
                        }}
                      >
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

                        {msg.senderId === (loggedInUser?._id || loggedInUser?.id) && (
                          <button
                            className="delete-message-btn"
                            onClick={async () => {
                              try {
                                await axios.delete(
                                 `http://localhost:5000/api/messages/${msg._id}`
                                );

                                setMessages((prev) =>
                                  prev.filter((m) => m._id !== msg._id)
                                );

                                toast.success("Message deleted");
                              } catch (err) {
                                toast.error("Failed to delete message");
                              }
                            }}
                         >
                           🗑
                          </button>
                        )}
                      </div>
                        
                   </div>
                  ))
                ) : (
                  <p className="empty-text">No messages yet. Start the chat ✨</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showEmojiPicker && (
                <div className="emoji-picker-wrapper">
                 <EmojiPicker
                    height={350}
                    width={280}
                    onEmojiClick={(emojiData) => {
                      setNewMessage((prev) => prev + emojiData.emoji);
                    }}
                    theme="dark"
                  />
                </div>
              )}
              {typingUser && (
                <p className="typing-indicator">
                  {typingUser} is typing...
                </p>
              )}

              <div className="chat-input-row">
                <button
                  type="button"
                  className="emoji-toggle-btn"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  😊
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);

                    socketRef.current.emit("typing", {
                      meetupId: chatMeetup._id,
                      userName: loggedInUser?.name,
                    });

                    clearTimeout(window.typingTimeout);

                    window.typingTimeout = setTimeout(() => {
                      socketRef.current.emit("stop_typing", {
                        meetupId: chatMeetup._id,
                      });
                    }, 1200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Write a message..."
                  
                />

                <button
                  disabled={isSending}
                  onClick={handleSendMessage}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}