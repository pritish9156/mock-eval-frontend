import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import Particles from "react-tsparticles";
import toast from "react-hot-toast";
import "./Login.css";

const ResetPassword = () => {

  // 🔥 GET TOKEN FROM URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const glow = document.querySelector(".mouse-glow");

    const moveGlow = (e) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    };

    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/auth/reset-password", {
        token,
        newPassword: password,
      });
      toast.success("Password reset successful ✅");
      setLoading(false);
      window.location.href = "/login";
    } catch (error) {
      setLoading(false);
      toast.error("Invalid or expired link ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="blob one"></div>
      <div className="blob two"></div>
      <div className="blob three"></div>
      <div className="animated-bg"></div>
      <Particles
        className="particles"
        options={{
          particles: {
            number: { value: 35 },
            size: { value: 2 },
            move: { speed: 0.8 },
            opacity: { value: 0.4 },
          },
        }}
      />
      <div className="mouse-glow"></div>

      <Tilt glareEnable={true} glareMaxOpacity={0.15} scale={1.02}>
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="title">Reset Password</h2>
          <p className="subtitle">
            Enter a new password to regain secure access to your account.
          </p>

          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Reset Password 🔐"}
            </button>
          </form>
        </motion.div>
      </Tilt>
    </div>
  );
};

export default ResetPassword;