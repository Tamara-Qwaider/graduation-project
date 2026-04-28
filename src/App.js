import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import LoginPage from "./LoginPage";
import Signup from "./Signup";
import Interests from "./Interests";
import Profile from "./Profile";
import MeetupPage from "./MeetupPage";
import ProtectedRoute from "./ProtectedRoute";
import ActivityPage from "./ActivityPage";
import AdminPage from "./AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interests"
        element={
          <ProtectedRoute>
            <Interests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meetups"
        element={
          <ProtectedRoute>
            <MeetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;