import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ForceResetPassword = () => {

  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  const handleReset = async () => {

    if (!password) return toast.error("Enter password");

    try {
      await axios.post(
        "http://localhost:8080/auth/force-reset-password",
        { password },
        { headers: { Authorization: "Bearer " + token } }
      );

      toast.success("Password updated ✅");

      localStorage.setItem("mustChangePassword", "false");

      window.location.href = "/";

    } catch {
      toast.error("Failed ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>Set New Password</h2>

        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleReset}>
          Update Password
        </button>

      </div>
    </div>
  );
};

export default ForceResetPassword;