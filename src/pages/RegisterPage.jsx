import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError('');
  };

  const validate = () => {
    if (formData.password.length < 6)
      return setError("Пароль должен содержать минимум 6 символов");
    if (formData.password !== formData.confirmPassword)
      return setError("Пароли не совпадают");
    if (!acceptedTerms)
      return setError("Необходимо принять условия");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }

      localStorage.setItem("userId", data.userId);
      navigate(`/profile/${data.userId}`);
    } 
    catch {
      setError("Ошибка соединения с сервером");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">📝 Регистрация</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submit}>

        <label className="label">Имя пользователя</label>
        <input className="input" name="username" value={formData.username} onChange={handleChange} />

        <label className="label">Email</label>
        <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} />

        <label className="label">Пароль</label>
        <div className="password-wrapper">
          <input className="input" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <label className="label">Подтверждение пароля</label>
        <div className="password-wrapper">
          <input className="input" type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />


          <span className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? "🙈" : "👁"}
          </span>
        </div>

        <label style={{ marginTop: 15 }}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          /> Я принимаю условия
        </label>

        <button className="btn">Создать аккаунт</button>

      </form>

      <p style={{ marginTop: 15, textAlign: "center" }}>
        Уже есть аккаунт? <Link className="link" to="/login">Войти</Link>
      </p>
    </div>
  );
}
