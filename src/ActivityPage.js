import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios"; 
import "./ActivityPage.css";
import toast, { Toaster } from "react-hot-toast"; 

/* ==========================================================================
   1. Sub-Components (المكونات الفرعية)
   ========================================================================== */

const DetailsPopup = ({ isOpen, onClose, activity }) => {
  if (!isOpen || !activity) return null;
  return (
    <div className="activity-popup-overlay" onClick={onClose}>
      <div className="activity-popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="activity-popup-close" onClick={onClose}>✕</button>
        <div className="activity-popup-header">
          <div className="activity-popup-icon">{activity.icon || "📍"}</div>
          <h2>{activity.title}</h2>
          <p>ACTIVITY DETAILS</p>
        </div>
        <div className="activity-popup-sections">
          <div className="activity-popup-row">
            <span>📍</span>
            <div><small>Location</small><p>{activity.location}</p></div>
          </div>
          <div className="activity-popup-row">
            <span>📅</span>
            <div><small>Date & Time</small><p>{activity.date} • {activity.time}</p></div>
          </div>
          <div className="activity-popup-row">
            <span>👤</span>
            <div><small>Hosted By</small><p>{activity.hostName || activity.description}</p></div>
          </div>
        </div>
        <button className="activity-popup-main-btn" onClick={onClose}>Close Details</button>
      </div>
    </div>
  );
};

const InviteCard = ({ id, location, host, date, time, participantsCount, onAccept, onDeny }) => (
  <div className="invite-card">
    <div className="invite-card-top">
      <div className="invite-icon">📍</div>
      <div>
        <h3>{location}</h3>
        <p>Hosted by {host?.name}</p>
      </div>
    </div>
    <div className="invite-details">
      <div><span>Date</span><strong>{date}</strong></div>
      <div><span>Time</span><strong>{time}</strong></div>
      <div><span>Attendees</span><strong>{participantsCount}</strong></div>
    </div>
    <div className="invite-actions">
      <button className="deny-btn" onClick={() => onDeny(id)}>✕ Deny</button>
      <button className="accept-btn" onClick={() => onAccept(id)}>✓ Accept</button>
    </div>
  </div>
);

const ActivityCard = ({ _id, title, description, date, time, location, participantsCount, icon, onDetailsClick, onLeave }) => (
  <div className="activity-card">
    <div className="activity-card-left-icon">{icon || "⛺"}</div>
    <div className="activity-card-content">
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="activity-meta">
        <span>📅 {date} {time ? `• ${time}` : ""}</span>
        <span>👥 {participantsCount} people</span>
      </div>
      <div className="activity-card-actions">
        <button className="details-btn" onClick={() => onDetailsClick({ _id, title, icon, location, date, time, description, participantsCount })}>
          Activity Details
        </button>
        <button className="leave-btn" onClick={() => onLeave(_id)}>Leave Activity</button>
      </div>
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
            <div className="stat-label"><span>{item.icon}</span><span>{item.label}</span></div>
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
  const [loading, setLoading] = useState(true); // حالة التحميل
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentActivities, setCurrentActivities] = useState([]);
  const [dashboardFocus, setDashboardFocus] = useState(null);

  const [invites, setInvites] = useState([
    { id: 1, title: "Dead Sea Trip", location: "Dead Sea", host: { name: "Zaid" }, date: "2026-04-20", time: "10:00 AM", participantsCount: 12 },
    { id: 2, title: "Wadi Rum Desert Camp", location: "Wadi Rum", host: { name: "Sami" }, date: "2026-04-22", time: "06:00 PM", participantsCount: 25 },
    { id: 3, title: "Petra Walk", location: "Petra Walk", host: { name: "Noor" }, date: "2026-04-25", time: "08:00 PM", participantsCount: 10 },
  ]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/activities");
      setCurrentActivities(response.data);
      if (response.data.length > 0) {
        setDashboardFocus(response.data[0]);
      }
    } catch (err) {
      toast.error("Failed to load activities from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClick = (activity) => {
    setDashboardFocus(activity);
    setSelectedActivity(activity);
    setIsPopupOpen(true);
    // حركة ذكية: التوجه للدوائر بسلاسة عند اختيار نشاط
    const dashboard = document.querySelector('.stats-scroll');
    if(dashboard) dashboard.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAccept = async (id) => {
    const inviteToAccept = invites.find(inv => inv.id === id);
    if (inviteToAccept) {
      const activityData = {
        title: inviteToAccept.title,
        location: inviteToAccept.location,
        description: `Trip hosted by ${inviteToAccept.host.name}`,
        date: inviteToAccept.date,
        time: inviteToAccept.time,
        participantsCount: inviteToAccept.participantsCount,
        icon: "⛺"
      };
      try {
        const response = await axios.post("http://localhost:5000/api/activities", activityData);
        setCurrentActivities(prev => [response.data, ...prev]);
        setInvites(prev => prev.filter(inv => inv.id !== id));
        setDashboardFocus(response.data);
        toast.success(`Joined ${inviteToAccept.title}!`);
      } catch (err) {
        toast.error("Connection error");
      }
    }
  };

  const handleLeaveActivity = async (id) => {
    if (window.confirm("Are you sure you want to leave this activity?")) {
      try {
        await axios.delete(`http://localhost:5000/api/activities/${id}`);
        const updatedList = currentActivities.filter(act => act._id !== id);
        setCurrentActivities(updatedList);
        if (updatedList.length > 0) setDashboardFocus(updatedList[0]);
        else setDashboardFocus(null);
        toast("Activity removed", { icon: '🗑️' });
      } catch (err) {
        toast.error("Error leaving activity.");
      }
    }
  };

  // بيانات الدوائر (تعتمد على التركيز الحالي)
  const statsData = [
    {
      title: "Meetup Info",
      items: [
        { label: "Meetup Name", value: dashboardFocus?.title || "No Plans", icon: "📝" },
        { label: "Confirmed", value: dashboardFocus?.participantsCount || "0", icon: "✅" },
        { label: "Pending", value: "18", icon: "⏳" }
      ]
    },
    {
      title: "Status",
      items: [
        { label: "Date", value: dashboardFocus?.date || "-", icon: "📅" },
        { label: "Time", value: dashboardFocus?.time || "-", icon: "⏰" },
        { label: "Status", value: dashboardFocus ? "On Time" : "-", icon: "🔥" }
      ]
    },
    {
      title: "Location Details",
      items: [
        { label: "Location", value: dashboardFocus?.location || "-", icon: "📍" },
        { label: "Weather", value: "22°C", icon: "☀️" },
        { label: "Distance", value: "5km", icon: "🏃" }
      ]
    }
  ];

  if (loading) {
    return <div className="loading-state">Loading Activities...</div>;
  }

  return (
    <div className="activity-page-bg">
      <Toaster position="top-center" reverseOrder={false} />
      <DetailsPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} activity={selectedActivity} />
      <div className="activity-navbar-wrap"><Navbar /></div>

      <main className="activity-main">
        {/* قسم الدعوات */}
        <section className="activity-section">
          <h3 className="section-heading">Meetup Invites</h3>
          <div className="invites-scroll">
            {invites.length > 0 ? (
              invites.map(inv => (
                <InviteCard 
                  key={inv.id} 
                  {...inv} 
                  onAccept={handleAccept} 
                  onDeny={(id) => setInvites(invites.filter(i => i.id !== id))} 
                />
              ))
            ) : (
              <p className="empty-text">You're all caught up! No new invites.</p>
            )}
          </div>
        </section>

        {/* قسم الأنشطة الحالية */}
        <section className="activity-section">
          <h3 className="section-heading">My Current Activities</h3>
          <div className="activities-list">
            {currentActivities.length > 0 ? (
              currentActivities.map(act => (
                <ActivityCard 
                  key={act._id} 
                  {...act} 
                  onDetailsClick={handleDetailsClick} 
                  onLeave={handleLeaveActivity} 
                />
              ))
            ) : (
              <p className="empty-text">No joined activities yet. Check your invites!</p>
            )}
          </div>
        </section>

        {/* لوحة التحكم (الدوائر) */}
        <section className="activity-section">
          <h3 className="section-heading centered">Dashboard Overview</h3>
          <div className="stats-scroll">
            {statsData.map((stat, index) => (
              <StatCircle key={index} title={stat.title} items={stat.items} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}