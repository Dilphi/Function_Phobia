import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }

      // сохраняем ID юзера
      localStorage.setItem("userId", data.userId);

      navigate(`/profile/${data.userId}`);
    } 
    catch {
      setError("Ошибка соединения с сервером");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">🔐 Вход</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submit}>
        <label className="label">Email</label>
        <input className="input" type="email" name="email" onChange={handleChange} />

        <label className="label">Пароль</label>
        <div className="password-wrapper">
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            name="password"
            onChange={handleChange}
          />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <button className="btn">Войти</button>
      </form>

      <p style={{ marginTop: 15 }}>
        Нет аккаунта? <Link className="link" to="/register">Регистрация</Link>
      </p>
    </div>
  );
}
