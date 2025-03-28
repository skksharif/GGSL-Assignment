import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch("https://reqres.in/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Welcome to Global Groupware!");
        navigate("/users");
      } else {
        toast.error("Ooops! Invalid Credentials");
      }
    } catch (err) {
      toast.error("Ooops! Something Went Wrong");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="main">
      <div className="blue-bg"></div>
      <div className="red-bg"></div>

      <ToastContainer />

      <h2 className="main-title">Global Groupware Solutions Limited</h2>
      <div className="login-container">
        <h3 className="login-text">Login</h3>
        <form onSubmit={handleLogin}>
          <input
            className="email-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              className="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
