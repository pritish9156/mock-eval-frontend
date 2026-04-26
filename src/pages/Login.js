import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import Particles from "react-tsparticles";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      window.location.reload();

      // 🔥 REDIRECT HERE
      navigate("/");

    } catch {
      alert("Invalid Credentials ❌");
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
                onClick={() => alert("Forgot Password Clicked")}
                >
                Forgot Password?
            </button>

          </form>

        </motion.div>

      </Tilt>

    </div>
  );
};

export default Login;