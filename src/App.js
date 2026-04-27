import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Batch from "./pages/Batch";
import Technology from "./pages/Technology";
import Assignments from "./pages/Assignments";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Evaluations from "./pages/Evaluations";
import Reports from "./pages/Reports";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
    <ToastContainer
    position="top-right"
    autoClose={3000}
    theme="dark"
    closeButton={false} // 🔥 FIX
    />
      {token ? (
        <Routes>
          <Route path="/" element={<Dashboard />}>
            <Route path="users" element={<Users />} />
            <Route path="batch" element={<Batch />} />
            <Route path="technology" element={<Technology />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="evaluations" element={<Evaluations />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      ) : (
        <Login />
      )}
    </BrowserRouter>
  );
}

export default App;