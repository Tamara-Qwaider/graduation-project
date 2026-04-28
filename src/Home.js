import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Users, Search, Star, X } from "lucide-react";
import Navbar from "./Navbar";
import "./HomePage.css";

const placesData = [
  {
    id: 1,
    name: "Petra",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
    location: "Jordan",
    rating: 4.9,
    description: "Ancient city carved in rose-red rock.",
    images: [
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
      "https://images.unsplash.com/photo-1580706486641-ebec9f673d36",
      "https://images.unsplash.com/photo-1662747975053-ee44de7015a0"
    ]
  },
  {
    id: 2,
    name: "Dead Sea",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    location: "Jordan",
    rating: 4.8,
    description: "Lowest point on Earth.",
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb"]
  },
  {
    id: 3,
    name: "Wadi Rum",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    location: "Jordan",
    rating: 4.7,
    description: "Beautiful desert adventure.",
    images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"]
  },
  {
    id: 8,
    name: "Jerash",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    location: "Jordan",
    rating: 4.8,
    description: "Ancient Roman ruins and columns.",
    images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c"]
  },
  {
    id: 9,
    name: "Ajloun Castle",
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    location: "Jordan",
    rating: 4.7,
    description: "Historic Islamic castle with scenic views.",
    images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"]
  },
  {
    id: 10,
    name: "Dana Reserve",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    location: "Jordan",
    rating: 4.9,
    description: "Nature reserve with breathtaking landscapes.",
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb"]
  },
  {
    id: 11,
    name: "Umm Qais",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    location: "Jordan",
    rating: 4.6,
    description: "Ancient hilltop city overlooking the valley.",
    images: ["https://images.unsplash.com/photo-1493246507139-91e8fad9978e"]
  },
  {
    id: 12,
    name: "Aqaba Beach",
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    location: "Jordan",
    rating: 4.8,
    description: "Relaxing beach with clear blue water.",
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"]
  },
  {
    id: 4,
    name: "Cafe Milano",
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    location: "Amman",
    rating: 4.5,
    description: "Cozy cafe.",
    images: []
  },
  {
    id: 5,
    name: "Street Coffee",
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
    location: "Amman",
    rating: 4.6,
    description: "Fresh coffee.",
    images: []
  },
  {
    id: 6,
    name: "Levant Restaurant",
    category: "Restaurants",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    location: "Amman",
    rating: 4.8,
    description: "Traditional food.",
    images: []
  },
  {
    id: 7,
    name: "Roman Amphitheater",
    category: "Activities",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427",
    location: "Amman",
    rating: 4.7,
    description: "Historic Roman site.",
    images: []
  }
];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [savedPlaces, setSavedPlaces] = useState(() => {
    return JSON.parse(localStorage.getItem("savedPlaces")) || [];
  });

  const navigate = useNavigate();

  const categories = [...new Set(placesData.map((p) => p.category))];
  const userInterests = JSON.parse(localStorage.getItem("interests")) || [];

  const cleanText = (text) =>
    text.toLowerCase().replace(/[^\w\s]/g, "").trim();

  const recommendedPlaces = placesData.filter((place) =>
    userInterests.some((interest) => {
      const cleanInterest = cleanText(interest);
      const cleanCategory = cleanText(place.category);

      return (
        cleanInterest.includes(cleanCategory) ||
        cleanCategory.includes(cleanInterest.split(" ")[0])
      );
    })
  );

  const toggleSave = (place) => {
    const isSaved = savedPlaces.some((p) => p.id === place.id);
    let updatedPlaces;
    if (isSaved) {
      updatedPlaces = savedPlaces.filter((p) => p.id !== place.id);
    } else {
      updatedPlaces = [...savedPlaces, place];
    }
    setSavedPlaces(updatedPlaces);
    localStorage.setItem("savedPlaces", JSON.stringify(updatedPlaces));
  };

  const Card = ({ item }) => (
    <div onClick={() => setSelected(item)} className="home-card">
      <img src={item.image} className="home-card-image" alt={item.name} />
      <div className="home-card-content">
        <h3>{item.name}</h3>
        <p>{item.location}</p>
        <div className="home-rating">
          <Star size={14} />
          {item.rating}
        </div>
      </div>
    </div>
  );

  const Section = ({ title, items }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    const scroll = (direction) => {
      const container = scrollRef.current;
      if (!container) return;
      container.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 200);
    };

    useEffect(() => {
      checkScroll();
    }, [items]);

    return (
      <div className="home-section">
        <div className="home-section-header">
          <h2>{title}</h2>
        </div>
        <div className="home-scroll-row">
          <div className="home-arrow-space">
            {canScrollLeft && (
              <button onClick={() => scroll("left")} className="home-arrow-btn">
                ❮
              </button>
            )}
          </div>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="home-cards-scroll no-scrollbar"
          >
            {items.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
          <div className="home-arrow-space">
            {canScrollRight && (
              <button onClick={() => scroll("right")} className="home-arrow-btn">
                ❯
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page-bg" style={{ position: "relative" }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* تنسيق العنوان العلوي اليساري الجديد */
        .vibe-top-header {
          position: absolute;
          top: 25px;
          left: 30px;
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: 6px;
          text-transform: uppercase;
          z-index: 50;
          /* تدرج لوني يناسب الثيم الداكن */
          background: linear-gradient(135deg, #ffffff 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 4px 8px rgba(168, 85, 247, 0.4));
          pointer-events: none;
        }

        /* إضافة مسافة علوية للـ Navbar والبحث لتفادي التداخل */
        .content-body {
          padding-top: 20px;
        }
      `}</style>

      {/* العنوان الجديد المضاف */}
      <h1 className="vibe-top-header">VIBE</h1>

      <div className="content-body">
        <Navbar />

        <div className="home-search-wrapper">
          <div className="home-search-box">
            <Search className="home-search-icon" />
            <input
              placeholder="Search..."
              className="home-search-input"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {recommendedPlaces.length > 0 && (
          <Section
            title="Recommended For You"
            items={recommendedPlaces.filter((p) => {
              const term = search.toLowerCase();
              return `${p.name} ${p.location} ${p.category}`
                .toLowerCase()
                .includes(term);
            })}
          />
        )}

        {categories.map((cat) => (
          <Section
            key={cat}
            title={cat}
            items={placesData
              .filter((p) => p.category === cat)
              .filter((p) => {
                const term = search.toLowerCase();
                return `${p.name} ${p.location} ${p.category}`
                  .toLowerCase()
                  .includes(term);
              })}
          />
        ))}
      </div>

      {selected && (
        <div className="home-popup-overlay">
          <div className="home-popup-box">
            <button
              onClick={() => setSelected(null)}
              className="home-popup-close"
            >
              <X />
            </button>
            <h2 className="home-popup-title">{selected.name}</h2>
            <div className="home-popup-images">
              {(selected.images?.length ? selected.images : [selected.image]).map(
                (img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={selected.name}
                    className="home-popup-image"
                  />
                )
              )}
            </div>
            <div className="home-popup-info">
              <div className="home-popup-row">
                <span>📍</span>
                <span>{selected.location}</span>
              </div>
              <div className="home-popup-row">
                <Star size={16} />
                <span>{selected.rating} / 5</span>
              </div>
              <div>
                <p className="home-popup-about-title">About</p>
                <p>{selected.description}</p>
              </div>
            </div>
            <div className="home-popup-actions">
              <button
                onClick={() => toggleSave(selected)}
                className={`home-save-btn ${
                  savedPlaces.some((p) => p.id === selected.id) ? "saved" : ""
                }`}
              >
                <Bookmark size={18} />
              </button>
              <button
                onClick={() => {
                  navigate("/meetups", {
                    state: {
                      openCreate: true,
                      place: selected,
                    },
                  });
                }}
                className="home-create-btn"
              >
                <Users size={18} />
                Create a Meetup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}