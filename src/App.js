import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Batch from "./pages/Batch";
import Technology from "./pages/Technology";
import Assignments from "./pages/Assignments";
import Evaluations from "./pages/Evaluations";
import Reports from "./pages/Reports";
import Rounds from "./pages/Rounds";
import Participants from "./pages/Participants";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EvaluatorHistory from "./pages/EvaluatorHistory";
import AdminDashboard from "./pages/AdminDashboard";
import EvaluatorDashboard from "./pages/EvaluatorDashboard";
import { Toaster } from "react-hot-toast";
import CreateAdmin from "./pages/CreateAdmin";
import ResetPassword from "./pages/ResetPassword";
import ForceResetPassword from "./pages/ForceResetPassword";


function App() {
  const token = localStorage.getItem("token");
  const mustChange = localStorage.getItem("mustChangePassword") === "true";

  // 🔥 FORCE RESET REDIRECT (VERY IMPORTANT)
  if (token && mustChange && window.location.pathname !== "/force-reset-password") {
    return <Navigate to="/force-reset-password" />;
  }

  return (
    <BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        closeButton={false}
      />

      <Toaster
        position="top-right"
        />
      <Routes>

        {/* 🔥 LOGIN ROUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔥 PROTECTED ROUTES */}
        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        >
          <Route path="users" element={<Users />} />
          <Route path="batch" element={<Batch />} />
          <Route path="technology" element={<Technology />} />
          <Route path="participants" element={<Participants />} />
          <Route path="rounds" element={<Rounds />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="reports" element={<Reports />} />
          <Route path="my-evaluations" element={<EvaluatorDashboard />} />
          <Route path="my-evaluation-history" element={<EvaluatorHistory />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="create-admin" element={<CreateAdmin />} />
          <Route path="force-reset-password" element={<ForceResetPassword />} />
        </Route>

        {/* 🔥 DEFAULT REDIRECT */}
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;