import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./ActivityPage.css";

/* ==========================================================================
   1. Components (المكونات الفرعية)
   ========================================================================== */

// --- Details Popup Component ---
const DetailsPopup = ({ isOpen, onClose, activity }) => {
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  if (!isOpen || !activity) return null;

  const participants = activity.participants?.length
    ? activity.participants
    : [
        { name: "Sami", img: "https://i.pravatar.cc/150?u=sami" },
        { name: "Zaid", img: "https://i.pravatar.cc/150?u=zaid" },
        { name: "Noor", img: "https://i.pravatar.cc/150?u=noor" },
        { name: "Ahmad", img: "https://i.pravatar.cc/150?u=ahmad" },
      ];

  const handleClose = () => {
    setShowAllParticipants(false);
    onClose();
  };

  return (
    <div className="activity-popup-overlay" onClick={handleClose}>
      <div className="activity-popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="activity-popup-close" onClick={handleClose}>✕</button>

        <div className="activity-popup-header">
          <div className="activity-popup-icon">{activity.icon || "📍"}</div>
          <h2>{activity.location || activity.title}</h2>
          <p>ACTIVITY DETAILS</p>
        </div>

        <div className="activity-popup-sections">
          <div className="activity-popup-row">
            <span>📍</span>
            <div>
              <small>Location</small>
              <p>{activity.location || "Ajloun Reserve"}</p>
            </div>
          </div>

          <div className="activity-popup-row">
            <span>📞</span>
            <div>
              <small>Organizer Phone</small>
              <p>{activity.organizer?.phone || "+962 7X XXX XXXX"}</p>
            </div>
          </div>

          <div className="activity-popup-participants">
            <small>Confirmed Participants</small>
            <div className="participants-avatars-row">
              {participants.slice(0, 4).map((p, i) => (
                <img key={i} src={p.img} alt={p.name} className="participant-avatar" />
              ))}
              <button 
                className="participant-more-btn" 
                onClick={() => setShowAllParticipants(!showAllParticipants)}
              >
                +{activity.participantsCount || 0}
              </button>
            </div>

            {showAllParticipants && (
              <div className="participants-list-box">
                <ul>
                  {participants.map((p, i) => <li key={i}>{p.name}</li>)}
                  <li className="more-members">+{activity.participantsCount || 0} more members</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <button className="activity-popup-main-btn" onClick={handleClose}>
          Close Details
        </button>
      </div>
    </div>
  );
};

// --- Invite Card Component ---
const InviteCard = ({ id, location, host, date, time, participantsCount, onAccept, onDeny }) => (
  <div className="invite-card">
    <div className="invite-card-top">
      <div className="invite-icon">📍</div>
      <div>
        <h3>{location}</h3>
        <p>Hosted by {host.name}</p>
      </div>
    </div>
    <div className="invite-details">
      <div><span>Date</span><strong>{date}</strong></div>
      <div><span>Time</span><strong>{time}</strong></div>
      <div><span>Attendees</span><strong>{participantsCount} people</strong></div>
    </div>
    <div className="invite-actions">
      <button className="deny-btn" onClick={() => onDeny(id)}>✕ Deny</button>
      <button className="accept-btn" onClick={() => onAccept(id)}>✓ Accept</button>
    </div>
  </div>
);

// --- Activity Card Component ---
const ActivityCard = ({ id, title, description, date, time, location, participantsCount, icon, hasButtons, onDetailsClick, onLeave }) => (
  <div className="activity-card">
    <div className="activity-card-left-icon">{icon}</div>
    <div className="activity-card-content">
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="activity-meta">
        <span>📅 {date} {time ? `• ${time}` : ""}</span>
        <span>👥 {participantsCount} people</span>
      </div>
      {hasButtons && (
        <div className="activity-card-actions">
          <button 
            className="details-btn" 
            onClick={() => onDetailsClick({ id, title, icon, location, date, time, participantsCount })}
          >
            Activity Details
          </button>
          <button className="leave-btn" onClick={() => onLeave(id)}>Leave Activity</button>
        </div>
      )}
    </div>
  </div>
);

// --- Stat Circle Component ---
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
   2. Main Page (الصفحة الرئيسية)
   ========================================================================== */

export default function ActivityPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // --- Initial Data ---
  const defaultInvites = [
    { id: 1, meetupId: "m_1", title: "Dead Sea Trip", location: "Dead Sea", host: { id: "u_9", name: "Zaid" }, date: "2026-04-20", time: "10:00", participantsCount: 12 },
    { id: 2, meetupId: "m_2", title: "Wadi Rum Desert Camp", location: "Wadi Rum", host: { id: "u_2", name: "Sami" }, date: "2026-04-22", time: "06:00 PM", participantsCount: 25 },
    { id: 3, meetupId: "m_3", title: "Petra Walk", location: "Petra Walk", host: { id: "u_3", name: "Noor" }, date: "2026-04-25", time: "08:00 PM", participantsCount: 10 },
  ];

  const defaultActivities = [
    { id: 101, title: "Morning Hike", description: "A refreshing hike in Ajloun forest.", location: "Ajloun", date: "2026-04-18", time: "08:00", participantsCount: 10, icon: "🥾", hasButtons: true, participants: [], organizer: { phone: "+962 7X XXX XXXX" } },
    { id: 102, title: "Gaming Night", description: "Online tournament for FIFA players.", location: "Online", date: "2026-04-19", time: "09:00 PM", participantsCount: 24, icon: "🎮", hasButtons: true, participants: [], organizer: { phone: "+962 7X XXX XXXX" } },
  ];

  const allStats = [
    { title: "Meetup Info", items: [{ label: "Meetup Name", value: "Hiking Trip", icon: "📝" }, { label: "Confirmed", value: "42", icon: "✅" }, { label: "Pending", value: "18", icon: "⏳" }] },
    { title: "Status", items: [{ label: "Date", value: "April 15", icon: "📅" }, { label: "Time", value: "10:00 AM", icon: "⏰" }, { label: "Status", value: "On Time", icon: "🔥" }] },
    { title: "Location Details", items: [{ label: "Location", value: "Ajloun", icon: "📍" }, { label: "Weather", value: "22°C", icon: "☀️" }, { label: "Distance", value: "5km", icon: "🏃" }] },
  ];

  // --- State Management ---
  const [invites, setInvites] = useState(() => JSON.parse(localStorage.getItem("activityInvites")) || defaultInvites);
  const [currentActivities, setCurrentActivities] = useState(() => JSON.parse(localStorage.getItem("currentActivities")) || defaultActivities);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem("activityInvites", JSON.stringify(invites)); }, [invites]);
  useEffect(() => { localStorage.setItem("currentActivities", JSON.stringify(currentActivities)); }, [currentActivities]);

  // --- Handlers ---
  const handleDeny = (id) => {
    setInvites(prev => prev.filter(inv => inv.id !== id));
  };

  const handleAccept = (id) => {
    const inviteToAccept = invites.find(inv => inv.id === id);
    if (inviteToAccept) {
      const newActivity = {
        id: Date.now(),
        title: inviteToAccept.title,
        location: inviteToAccept.location,
        description: `Trip hosted by ${inviteToAccept.host.name}`,
        date: inviteToAccept.date,
        time: inviteToAccept.time,
        participantsCount: inviteToAccept.participantsCount,
        icon: "⛺",
        hasButtons: true,
        participants: [],
        organizer: { phone: "+962 7X XXX XXXX" },
      };
      setCurrentActivities([newActivity, ...currentActivities]);
      setInvites(invites.filter(inv => inv.id !== id));
    }
  };

  const handleLeaveActivity = (id) => {
    setCurrentActivities(prev => prev.filter(act => act.id !== id));
  };

  return (
    <div className="activity-page-bg">
      <DetailsPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        activity={selectedActivity} 
      />

      <div className="activity-navbar-wrap">
        <Navbar />
      </div>

      <main className="activity-main">
        {/* Invites Section */}
        <section className="activity-section">
          <h3 className="section-heading">Meetup Invites</h3>
          <div className="invites-scroll">
            {invites.length > 0 ? (
              invites.map(invite => (
                <InviteCard key={invite.id} {...invite} onAccept={handleAccept} onDeny={handleDeny} />
              ))
            ) : (
              <p className="empty-text">No new invites.</p>
            )}
          </div>
        </section>

        {/* Current Activities Section */}
        <section className="activity-section">
          <h3 className="section-heading">Current Activity</h3>
          {currentActivities.length > 0 ? (
            currentActivities.map(act => (
              <ActivityCard 
                key={act.id} 
                {...act} 
                onDetailsClick={(a) => { setSelectedActivity(a); setIsPopupOpen(true); }} 
                onLeave={handleLeaveActivity} 
              />
            ))
          ) : (
            <p className="empty-text">You have no active activities.</p>
          )}
        </section>

        {/* Stats Follow Up Section */}
        <section className="activity-section">
          <h3 className="section-heading centered">Follow Up Meetup</h3>
          <div className="stats-scroll">
            {allStats.map((stat, index) => (
              <StatCircle key={index} title={stat.title} items={stat.items} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}