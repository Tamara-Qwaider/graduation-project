import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Users, Search, Star, X } from "lucide-react";
import Navbar from "./Navbar";
import "./HomePage.css";

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [tripPlan, setTripPlan] = useState("");
  const [showTripPlan, setShowTripPlan] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  

  const [placesData, setPlacesData] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [viewedPlaces, setViewedPlaces] = useState(() => {
  return JSON.parse(localStorage.getItem("viewedPlaces")) || [];
  });
  
  // الحفاظ على حالة الأماكن من كائن المستخدم
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.savedPlaces || [];
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const generateTripPlan = async () => {
  try {
    setAiLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch("http://localhost:5000/api/ai/plan-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        places: placesData,
      }),
    });

    const data = await res.json();

    setTripPlan(data.tripPlan);
    setShowTripPlan(true);
  } catch (err) {
    console.error(err);
  }finally {
    setAiLoading(false);
  }
};

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/places");
        const data = await res.json();
        setPlacesData(data);
      } catch (err) { console.log("Error fetching places", err); }
    };
    fetchPlaces();
  }, []);
  useEffect(() => {
  // eslint-disable-next-line no-unused-vars
  const fetchAIRecommendations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || placesData.length === 0) return;

      const res = await fetch("http://localhost:5000/api/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            ...user,
            viewedPlaces:
              JSON.parse(localStorage.getItem("viewedPlaces")) || [],
          },
          places: placesData,
        }),
      });

      const data = await res.json();

      if (data.recommendations) {
        const merged = data.recommendations
          .map((rec) => {
            const originalPlace = placesData.find(
              (p) => (p._id || p.id) === rec.placeId
            );

            if (!originalPlace) return null;

            return {
              ...originalPlace,
              aiReason: rec.aiReason,
              aiMatchScore: rec.matchScore,
            };
          })
          .filter(Boolean);

        setAiRecommendations(merged);
      }
    } catch (err) {
      console.error("AI Recommendation Error:", err);
    }
  };

  //fetchAIRecommendations();
}, [placesData]);

  // --- دالة الحفظ المحدثة (ترسل الإضافة فقط) ---
  const toggleSave = async (place) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id || storedUser?.id;

    if (!userId) {
      alert("Please login first!");
      return;
    }

    const isAlreadySaved = savedPlaces.some(p => (p._id || p.id) === (place._id || place.id));
    let payload = {};

    if (isAlreadySaved) {
      // للحذف: نرسل المصفوفة الجديدة كاملة بدون العنصر
      const newList = savedPlaces.filter(p => (p._id || p.id) !== (place._id || place.id));
      payload = { savedPlaces: newList };
    } else {
      // للإضافة: نرسل المكان كـ "newPlace" لكي يضيفه السيرفر للموجود
      payload = { newPlace: place };
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/profile/update/${userId}`, {
        method: "PUT",
        headers: {
         "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        setSavedPlaces(data.user.savedPlaces || []);
      }
    } catch (err) {
      console.error("Save Error", err);
    }
  };

  // --- المكونات الداخلية والتصاميم (Card, Section) كما هي تماماً ---
  const Card = ({ item }) => (
     <div
       onClick={() => {
          setSelected(item);
          const viewed = JSON.parse(localStorage.getItem("viewedPlaces")) || [];

          const updatedViewed = [
            item,
            ...viewed.filter((p) => (p._id || p.id) !== (item._id || item.id)),
          ].slice(0, 10);

          localStorage.setItem("viewedPlaces", JSON.stringify(updatedViewed));
          setViewedPlaces(updatedViewed);
          setCurrentImageIndex(0);
        }}
        className="home-card"
     >
      <img src={item.image} className="home-card-image" alt={item.name} />
      <div className="home-card-content">
        <h3>{item.name}</h3>
        <p>{item.location}</p>
        <div className="home-rating"><Star size={14} /> {item.rating}</div>
        {item.recommendationReason && (
          <p className="recommendation-reason">
            ✨ {item.recommendationReason}
          </p>
        )}

        {item.aiReason && (
          <p className="recommendation-reason">
            🤖 {item.aiReason}
         </p>
        )}
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
      container.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
      setTimeout(checkScroll, 200);
    };
    useEffect(() => { checkScroll(); }, [items]);
    return (
      <div className="home-section">
        <div className="home-section-header"><h2>{title}</h2></div>
        <div className="home-scroll-row">
          <div className="home-arrow-space">
            {canScrollLeft && <button onClick={() => scroll("left")} className="home-arrow-btn">❮</button>}
          </div>
          <div ref={scrollRef} onScroll={checkScroll} className="home-cards-scroll no-scrollbar">
            {items.map((item) => <Card key={item._id || item.id} item={item} />)}
          </div>
          <div className="home-arrow-space">
            {canScrollRight && <button onClick={() => scroll("right")} className="home-arrow-btn">❯</button>}
          </div>
        </div>
      </div>
    );
  };

  // معالجة الفئات والتوصيات
 const categories = [
  ...new Set(
    placesData
      .map((p) => p.category)
      .filter((cat) => cat !== "Suggestions")
  ),
];

const loggedUser = JSON.parse(localStorage.getItem("user"));
const userInterests = loggedUser?.interests || [];

const cleanText = (text = "") =>
  text.toLowerCase().replace(/[^\w\s]/g, "").trim();



const getRecommendationScore = (place) => {
  let score = 0;

  const placeCategory = cleanText(place.category);
  const placeName = cleanText(place.name);
  const placeDescription = cleanText(place.description);

  viewedPlaces.forEach((viewed) => {
    const viewedCategory = cleanText(viewed.category);

    if (viewedCategory === placeCategory) {
      score += 2;
    }

    if (
      cleanText(viewed.location) ===
      cleanText(place.location)
    ) {
      score += 1;
    }
  });
  savedPlaces.forEach((saved) => {
  const savedCategory = cleanText(saved.category);

  if (savedCategory === placeCategory) {
    score += 3;
  }

  if (cleanText(saved.location) === cleanText(place.location)) {
    score += 1;
  }
});

  userInterests.forEach((interest) => {
    const cleanInterest = cleanText(interest);

    if (
      placeCategory.includes(cleanInterest) ||
      cleanInterest.includes(placeCategory)
    ) {
      score += 4;
    }

    if (placeName.includes(cleanInterest)) {
      score += 2;
    }

    if (placeDescription.includes(cleanInterest)) {
      score += 1;
    }
  });

  if ((place.rating || 0) >= 4.5) {
    score += 2;
  }

  if ((place.rating || 0) >= 4) {
    score += 1;
  }

  return score;
};

const getRecommendationReason = (place) => {
  const placeCategory = cleanText(place.category);
  const placeName = cleanText(place.name);
  const placeDescription = cleanText(place.description);

  const matchedInterest = userInterests.find((interest) => {
    const cleanInterest = cleanText(interest);

    return (
      placeCategory.includes(cleanInterest) ||
      cleanInterest.includes(placeCategory) ||
      placeName.includes(cleanInterest) ||
      placeDescription.includes(cleanInterest)
    );
  });

  const matchedSavedPlace = savedPlaces.find(
  (saved) => cleanText(saved.category) === placeCategory
);

if (matchedSavedPlace) {
  return `Because you saved ${matchedSavedPlace.name}`;
}

  if (matchedInterest) {
    return `Because you like ${matchedInterest}`;
  }

  if ((place.rating || 0) >= 4.5) {
    return "Top rated place";
  }

  return "Popular recommendation";
};

const recommendedPlaces = placesData
  .map((place) => ({
    ...place,
    recommendationScore: getRecommendationScore(place),
    recommendationReason: getRecommendationReason(place),
  }))
  .filter((place) =>
    userInterests.length > 0 || viewedPlaces.length > 0
      ? place.recommendationScore >=4
      : (place.rating || 0) >= 4.5
  )
  .sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }

    return (b.rating || 0) - (a.rating || 0);
  })
  .slice(0, 5);

  return (
    <div className="home-page-bg" style={{ position: "relative" }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .vibe-top-header { position: absolute; top: 25px; left: 30px; font-size: 2.8rem; font-weight: 900; letter-spacing: 6px; text-transform: uppercase; z-index: 50; background: linear-gradient(135deg, #ffffff 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0px 4px 8px rgba(168, 85, 247, 0.4)); pointer-events: none; }
        .content-body { padding-top: 20px; }
        .home-save-btn.saved { color: #ff8a00 !important; fill: #ff8a00; }
      `}</style>

      <div className="logo"></div>
      <div className="content-body">
        <Navbar />
        <div className="ai-top-bar">
          <div className="ai-plan-link" onClick={() => {if (!aiLoading) generateTripPlan();}}>
            <span className="ai-icon">✦</span>
            <span>
              {aiLoading ? "Generating..." : "AI Planner"}
            </span>
          </div>
        </div>
        {showTripPlan && tripPlan && (
          <div className="ai-trip-box">
             <button
                className="close-ai-box"
                onClick={() => setShowTripPlan(false)}
              >
                ✕
              </button>
            <h2>🤖 AI Trip Plan</h2>
            <p>{tripPlan}</p>
          </div>
        )}
        <div className="home-search-wrapper">
          <div className="home-search-box">
            <Search className="home-search-icon" />
            <input placeholder="Search..." className="home-search-input" onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {(aiRecommendations.length > 0 ? aiRecommendations : recommendedPlaces).filter((p) =>
          `${p.name} ${p.location}`.toLowerCase().includes(search.toLowerCase())
        ).length > 0 ? (
          <Section
            title="Recommended For You"
            items={(aiRecommendations.length > 0 ? aiRecommendations : recommendedPlaces).filter((p) =>
              `${p.name} ${p.location}`.toLowerCase().includes(search.toLowerCase())
            )}
          />
        ) : (
          <div className="home-section">
            <div className="home-section-header">
              <h2>Recommended For You</h2>
            </div>

            <p className="empty-text">
              No recommendations yet. Explore more places to improve suggestions ✨
            </p>
          </div>
        )}

        {categories.map((cat) => (
          <Section key={cat} title={cat} items={placesData.filter(p => p.category === cat && `${p.name} ${p.location}`.toLowerCase().includes(search.toLowerCase()))} />
        ))}
      </div>

      {selected && (
        <div className="home-popup-overlay">
          <div className="home-popup-box">
            <button onClick={() => setSelected(null)} className="home-popup-close"><X /></button>
            <h2 className="home-popup-title">{selected.name}</h2>

            <div className="modern-gallery">
              <button
                className="gallery-arrow left"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0
                      ? (selected.images?.length || 1) - 1
                      : prev - 1
                  )
               }
              >
                ❮
              </button>

              <img
                src={
                    selected.images?.[currentImageIndex] || selected.image
                }
                alt={selected.name}
                className="modern-gallery-image"
              />

               <button
                  className="gallery-arrow right"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === (selected.images?.length || 1) - 1
                        ? 0
                        : prev + 1
                    )
                  }
                >
                  ❯
                </button>

                <div className="gallery-dots">
                  {(selected.images?.length
                    ? selected.images
                    : [selected.image]
                 ).map((_, i) => (
                   <div
                     key={i}
                     className={`gallery-dot ${
                        currentImageIndex === i ? "active" : ""
                     }`}
                    />
                  ))}
                </div>
              </div>

            <div className="home-popup-info">
              <div className="home-popup-row"><span>📍</span><span>{selected.location}</span></div>
              <div className="home-popup-row"><Star size={16} /><span>{selected.rating} / 5</span></div>
              <div><p className="home-popup-about-title">About</p><p>{selected.description}</p></div>
            </div>
            <div className="home-popup-actions">
              <button 
                onClick={() => toggleSave(selected)} 
                className={`home-save-btn ${savedPlaces.some((p) => (p._id || p.id) === (selected._id || selected.id)) ? "saved" : ""}`}
              >
                <Bookmark size={18} />
              </button>
              <button onClick={() => navigate("/meetups", { state: { openCreate: true, place: selected } })} className="home-create-btn">
                <Users size={18} /> Create a Meetup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}