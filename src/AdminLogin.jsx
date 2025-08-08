// AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './App.css';

function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      navigate("/gallery");
    } else {
      alert("Şifrə yanlışdır");
    }
  };

  return (
    <div className="admin">
        <h1>🔐 Giriş edin</h1>
      <input
        type="password"
        placeholder="Şifrəni daxil edin"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="password-input"
      />
      <button onClick={handleLogin} className="upload-btn">
        Giriş
      </button>
    </div>
  );
}

export default AdminLogin;
