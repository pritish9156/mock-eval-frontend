import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import "./Dashboard.css";
import { 
  FaUsers, 
  FaLayerGroup, 
  FaCode, 
  FaChartBar,
  FaClipboardList,
  FaTasks,
  FaFileAlt,
  FaUserFriends,
  FaStopwatch
} from "react-icons/fa";

const Dashboard = () => {

    const email = localStorage.getItem("email");

    const location = useLocation();
    const role = localStorage.getItem("role"); // 🔥 IMPORTANT

    // useEffect(() => {
    //   // const token = localStorage.getItem("token");

    //   // const headers = {
    //   //   Authorization: `Bearer ${token}`
    //   // };

    //   // const safeFetch = (url, setter) => {
    //   //   fetch(url, { headers })
    //   //     .then(res => {
    //   //       if (!res.ok) return null;
    //   //       return res.json();
    //   //     })
    //   //     .then(data => {
    //   //       if (data) setter(data.length);
    //   //     })
    //   //     .catch(err => console.log(err));
    //   // };

    //   // 🔥 Only admin should see these stats
    //   // if (role === "ADMIN") {
    //   //   safeFetch("http://localhost:8080/users", setUsers);
    //   //   safeFetch("http://localhost:8080/batch", setBatches);
    //   //   safeFetch("http://localhost:8080/evaluation", setEvaluations);
    //   // }

    // }, [role]);

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">

        <div className="sidebar-top">
          <h2>MockEval</h2>

          <ul>

            {/* 🔥 ADMIN ONLY */}
            {role === "ADMIN" && (
              <>

                  {/* DASHBOARD */}
                <li className={location.pathname === "/admin-dashboard" ? "active" : ""}>
                    <Link to="/admin-dashboard"><FaChartBar /> Dashboard</Link>
                </li>

                <li className={location.pathname === "/users" ? "active" : ""}>
                    <Link to="/users"><FaUsers /> Evaluators</Link>
                </li>

                <li className={location.pathname === "/batch" ? "active" : ""}>
                    <Link to="/batch"><FaLayerGroup /> Batch</Link>
                </li>

                <li className={location.pathname === "/technology" ? "active" : ""}>
                    <Link to="/technology"><FaCode /> Technology</Link>
                </li>

                <li className={location.pathname === "/participants" ? "active" : ""}>
                    <Link to="/participants"><FaUserFriends />Participants</Link>
                </li>

                <li className={location.pathname === "/rounds" ? "active" : ""}>
                    <Link to="/rounds"><FaStopwatch /> Rounds</Link>
                </li>

                <li className={location.pathname === "/assignments" ? "active" : ""}>
                    <Link to="/assignments"><FaClipboardList /> Assignments</Link>
                </li>

                <li className={location.pathname === "/evaluations" ? "active" : ""}>
                  <Link to="/evaluations"><FaTasks /> Evaluations</Link>
                </li>

                <li className={location.pathname === "/reports" ? "active" : ""}>
                    <Link to="/reports"><FaFileAlt /> Reports</Link>
                </li>
              </>
            )}

            {/* 🔥 EVALUATOR ONLY */}
            {role === "EVALUATOR" && (
              <>
                <li className={location.pathname === "/my-evaluations" ? "active" : ""}>
                    <Link to="/my-evaluations"><FaTasks /> My Evaluations</Link>
                </li>

                <li className={location.pathname === "/my-evaluation-history" ? "active" : ""}>
                    <Link to="/my-evaluation-history"><FaFileAlt /> Evaluation History</Link>
                </li>
              </>
            )}

          </ul>
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom">

          <div className="profile">
            <div className="avatar">
              {role === "ADMIN" ? "A" : "E"}
            </div>
            <div>
              <p className="name">
                {email ? email.split("@")[0] : "User"}
              </p>
              <span className="role">{role}</span>
            </div>
          </div>

          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.clear(); // 🔥 IMPORTANT FIX
              window.location.href = "/login";
            }}
          >
            Logout
          </button>

        </div>

      </div>

      {/* Main */}
      <div className="main">

        <div className="topbar">
          <h3>
            {role === "ADMIN" ? "Dashboard" : "My Evaluations"}
          </h3>
        </div>

        {/* 🔥 EVALUATOR AUTO REDIRECT */}
        {role === "EVALUATOR" && location.pathname === "/" && (
          <Navigate to="/my-evaluations" />
        )}

        {location.pathname === "/" && role === "ADMIN" ? (
            <AdminDashboard />
        ) : (
            <Outlet />
        )}

      </div>

    </div>
  );
};

export default Dashboard;