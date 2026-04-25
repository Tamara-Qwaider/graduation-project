import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const userString = localStorage.getItem("user");

  if (!userString) {
    return <Navigate to="/" replace />;
  }

  try {
    JSON.parse(userString);
  } catch (e) {
    return <Navigate to="/" replace />;
  }

  return children;
}