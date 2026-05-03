import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import Particles from "react-tsparticles";
import toast from "react-hot-toast";
import "./Login.css";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password
      });

      console.log("Login Response:", res.data); // 🔍 debug

      // 🔥 SAVE ALL DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("mustChangePassword", res.data.mustChangePassword);

      // 🔥 ALWAYS GO TO DASHBOARD (your App.js handles auth)
      if (res.data.mustChangePassword) {
        window.location.href = "/force-reset-password";
      } else {
        window.location.href = "/";
      }

    } catch {
      toast.error("Invalid Credentials ❌");
    }
  };


  // 🔥 Smooth mouse glow (fixed)
  useEffect(() => {
    const glow = document.querySelector(".mouse-glow");

    const moveGlow = (e) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    };

    window.addEventListener("mousemove", moveGlow);

    return () => {
      window.removeEventListener("mousemove", moveGlow);
    };
  }, []);

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Enter email");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:8080/auth/forgot-password", {
        email: resetEmail
      });

      toast.success("Reset link sent 📩");
      setShowForgot(false);

    } catch {
      toast.error("Email not found ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

         {/* 🔥 NEW ANIMATED BLOBS */}
        <div className="blob one"></div>
        <div className="blob two"></div>
        <div className="blob three"></div>

      {/* 🔥 Animated Gradient Background */}
      <div className="animated-bg"></div>

      {/* 🔥 Particles */}
      <Particles
        className="particles"
        options={{
          particles: {
            number: { value: 35 },
            size: { value: 2 },
            move: { speed: 0.8 },
            opacity: { value: 0.4 }
          }
        }}
      />

      {/* 🔥 Mouse Glow */}
      <div className="mouse-glow"></div>

      {/* 🔥 3D Tilt + Animation */}
      <Tilt glareEnable={true} glareMaxOpacity={0.15} scale={1.02}>
        
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <h2 className="title">MockEval</h2>

          <p className="typing-text">
            AI Powered Evaluation System
            <span className="cursor"></span>
          </p>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Login →</button>

            <button 
              type="button" 
              className="forgot"
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </button>

          </form>

        </motion.div>

      </Tilt>

      {showForgot && (
        <div className="forgot-modal">
          <div className="forgot-card">

            <h2 className="title">Reset Password</h2>

            <p className="subtitle">
              Enter your registered email and we’ll send you a secure reset link.
            </p>

            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>

            <button 
              className="primary-btn"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>

            <button 
              className="secondary-btn"
              onClick={() => setShowForgot(false)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;