import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import "./MeetupPage.css";

/* =========================
   📦 DATA
========================= */
const initialMeetups = [
  {
    id: 1,
    title: "Siq Canyon Trek",
    location: "Petra, Jordan",
    date: "April 28, 2026",
    time: "7:00 AM",
    attendees: ["Ali", "Sara", "Omar"],
    img: "https://picsum.photos/400/250?1",
  },
  {
    id: 2,
    title: "Wadi Rum Desert Camp",
    location: "Wadi Rum Desert",
    date: "May 1, 2026",
    time: "9:00 AM",
    attendees: ["Ali", "Sara", "Omar", "tamara", "leen", "ahmed"],
    img: "https://picsum.photos/400/250?2",
  },
  {
    id: 3,
    title: "Bedouin Cultural Gathering",
    location: "Amman Citadel",
    date: "May 5, 2026",
    time: "6:00 PM",
    attendees: ["amir", "safa", "Omar", "tamara"],
    img: "https://picsum.photos/400/250?3",
  },
  {
    id: 4,
    title: "Red Rock Formation Tour",
    location: "Aqaba Road",
    date: "May 10, 2026",
    time: "10:00 AM",
    attendees: ["Ali", "Sara"],
    img: "https://picsum.photos/400/250?4",
  },
  {
    id: 5,
    title: "lolos Garden",
    location: "lolos Garden",
    date: "May 1, 2026",
    time: "9:00 AM",
    attendees: ["Ali", "Sara", "Omar"],
    img: "https://picsum.photos/400/250?2",
  },
];

export default function MeetupPage() {
  /* =========================
     🧠 STATE
  ========================= */
  const emptyForm = {
    placeName: "",
    meetupName: "",
    date: "",
    time: "",
    invitePeople: "",
    notes: "",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const location = useLocation();
  const participantsRef = useRef(null);

  const [meetups, setMeetups] = useState(() => {
    return JSON.parse(localStorage.getItem("meetups")) || initialMeetups;
  });

  /* =========================
     💾 SAVE MEETUPS
  ========================= */
  useEffect(() => {
    localStorage.setItem("meetups", JSON.stringify(meetups));
  }, [meetups]);

  /* =========================
     📍 OPEN CREATE FROM HOME
  ========================= */
  useEffect(() => {
    if (location.state?.openCreate) {
      setIsCreateModalOpen(true);

      if (location.state.place) {
        setFormData((prev) => ({
          ...prev,
          placeName: location.state.place.name || "",
          meetupName: location.state.place.name || "",
        }));
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /* =========================
     🖱 CLOSE PARTICIPANTS DROPDOWN
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        participantsRef.current &&
        !participantsRef.current.contains(event.target)
      ) {
        setShowParticipants(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================
     🔍 FILTER
  ========================= */
  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredMeetups = meetups.filter((item) => {
    const searchableText =
      `${item.title} ${item.location} ${item.date}`.toLowerCase();

    return searchableText.includes(normalizedSearch);
  });

  /* =========================
     ⚙️ HANDLERS
  ========================= */
  const openMeetupDetails = (item) => {
    setSelectedMeetup(item);
    setShowParticipants(false);
  };

  const closeMeetupDetails = () => {
    setSelectedMeetup(null);
    setShowParticipants(false);
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(false);
  };

  const handleCreateMeetup = () => {
    if (!formData.placeName.trim()) {
      alert("Please enter place name");
      return;
    }

    if (!formData.date || !formData.time) {
      alert("Please enter date and time");
      return;
    }

 const loggedInUser = JSON.parse(localStorage.getItem("user"));

 const newMeetup = {
  id: Date.now(),
  title: formData.meetupName?.trim() || formData.placeName,
  location: formData.placeName,
  date: formData.date || "No date",
  time: formData.time || "No time",
  attendees: [],
  invitedPeople: formData.invitePeople
    ? formData.invitePeople
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    : [],
  img: "https://picsum.photos/400/250?random=" + Date.now(),
  createdBy: loggedInUser?.name || "Unknown",
};

    const updatedMeetups = [newMeetup, ...meetups];
    setMeetups(updatedMeetups);

    const existingActivities =
      JSON.parse(localStorage.getItem("currentActivities")) || [];

    const newActivity = {
      id: newMeetup.id,
      title: newMeetup.title,
      location: newMeetup.location,
      description: formData.notes?.trim() || "New meetup created",
      date: newMeetup.date,
      time: newMeetup.time,
      participantsCount: 0,
      icon: "📍",
      hasButtons: true,
      participants: [],
      organizer: {
        phone: "+962 7X XXX XXXX",
      },
    };

    const updatedActivities = [newActivity, ...existingActivities];
    localStorage.setItem("currentActivities", JSON.stringify(updatedActivities));

    closeCreateModal();
  };

  /* =========================
     🎨 UI
  ========================= */
  return (
    <div className="app meetup-page-bg">
      {/* ===== HEADER ===== */}
      <header className="meetup-header">
        <div className="header-top-row">
          <button className="filter-by-btn">
            <span className="filter-icon">⚙️</span> Filter by
          </button>
        </div>
      </header>

      <Navbar />

      {/* ===== SEARCH ===== */}
      <div className="search-container-center">
        <div className="search-wrapper-custom">
          <span className="search-glass-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by place name or letters..."
            className="main-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ===== CARDS ===== */}
      <div className="meetup-grid-layout">
        {filteredMeetups.length > 0 ? (
          filteredMeetups.map((item) => (
            <div
              key={item.id}
              className="meetup-card-custom"
              onClick={() => openMeetupDetails(item)}
            >
              <img src={item.img} alt={item.title} className="card-img" />

              <div className="card-content">
                <h3>{item.title}</h3>

                <p className="card-date">
                  {item.date} • {item.time}
                </p>

                <div className="card-attendees">
                  <span>👥 {item.attendees?.length || 0} participants</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results-msg">
            No meetups found for "{searchTerm}"
          </p>
        )}
      </div>

      {/* ===== POPUP DETAILS ===== */}
      {selectedMeetup && (
        <div className="popup-overlay" onClick={closeMeetupDetails}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMeetup.img}
              alt={selectedMeetup.title}
              className="popup-image"
            />

            <div className="popup-body">
              <div className="popup-info-row">
                <span className="info-icon">📍</span>
                <div>
                  <small>Location</small>
                  <p>{selectedMeetup.location}</p>
                </div>
              </div>

              <div className="popup-info-row">
                <span className="info-icon">📅</span>
                <div>
                  <small>Date & Time</small>
                  <p>
                    {selectedMeetup.date} • {selectedMeetup.time}
                  </p>
                </div>
              </div>

              <div className="popup-info-row">
                <span className="info-icon">👥</span>

                <div className="participants-block" ref={participantsRef}>
                  <small>Participants</small>

                  <div
                    className="participants-avatars"
                    onClick={() => setShowParticipants((prev) => !prev)}
                  >
                    {selectedMeetup.attendees?.slice(0, 3).map((person, index) => (
                      <div key={index} className="avatar-circle">
                        {person.charAt(0).toUpperCase()}
                      </div>
                    ))}

                    {selectedMeetup.attendees?.length > 3 && (
                      <div className="avatar-more">
                        +{selectedMeetup.attendees.length - 3}
                      </div>
                    )}
                  </div>

                  {showParticipants && (
                    <div className="participants-dropdown">
                      {selectedMeetup.attendees?.length > 0 ? (
                        selectedMeetup.attendees.map((person, index) => (
                          <div key={index} className="participant-row">
                            <div className="avatar-circle small">
                              {person.charAt(0).toUpperCase()}
                            </div>
                            <span>{person}</span>
                          </div>
                        ))
                      ) : (
                        <p className="no-participants">No participants yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="popup-message-box">
                <label>Message (Optional)</label>
                <textarea placeholder="Add a message..." />
              </div>

              <div className="popup-action-btns">
                <button
                  className="btn-cancel-popup"
                  onClick={closeMeetupDetails}
                >
                  Cancel
                </button>

                <button className="btn-send-request">
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      {isCreateModalOpen && (
        <div className="popup-overlay" onClick={closeCreateModal}>
          <div
            className="create-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="create-popup-header">
              <h2>CREATE MEETUP</h2>

              <button
                className="close-x-btn"
                onClick={closeCreateModal}
              >
                ✕
              </button>
            </div>

            <div className="create-popup-body">
              <div className="input-group">
                <label>Place Name</label>
                <input
                  type="text"
                  placeholder="Enter place name"
                  value={formData.placeName}
                  onChange={(e) =>
                    setFormData({ ...formData, placeName: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Meetup Title</label>
                <input
                  type="text"
                  placeholder="Give your meetup a title"
                  value={formData.meetupName}
                  onChange={(e) =>
                    setFormData({ ...formData, meetupName: e.target.value })
                  }
                />
              </div>

              <div className="date-time-row">
                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Time</label>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Invite People</label>
                <input
                  type="text"
                  placeholder="Add names or group"
                  value={formData.invitePeople}
                  onChange={(e) =>
                    setFormData({ ...formData, invitePeople: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>Notes</label>
                <textarea
                  placeholder="Optional message for participants..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="create-action-wrapper">
                <button
                  className="btn-final-create"
                  onClick={handleCreateMeetup}
                >
                  CREATE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE BUTTON ===== */}
      <button
        className="floating-create-btn"
        onClick={openCreateModal}
      >
        👑 Create Meetup
      </button>
    </div>
  );
}