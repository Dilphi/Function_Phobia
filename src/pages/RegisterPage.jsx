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
    console.log(`[INPUT] ${e.target.name}: ${e.target.value}`);
  };

  const validate = () => {
    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      console.warn('[VALIDATION] Пароль слишком короткий');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      console.warn('[VALIDATION] Пароли не совпадают');
      return false;
    }
    if (!acceptedTerms) {
      setError("Необходимо принять условия");
      console.warn('[VALIDATION] Условия не приняты');
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log('[REGISTER] Отправка данных на сервер:', formData);

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
      console.log('[REGISTER] Ответ сервера:', data);

      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        console.warn('[REGISTER] Ошибка регистрации:', data.error);
        return;
      }

      localStorage.setItem("userId", data.userId);
      console.log('[REGISTER] Успешная регистрация, перенаправление на профиль:', data.userId);

      navigate(`/profile/${data.userId}`);
    } 
    catch (err) {
      console.error('[REGISTER] Ошибка соединения с сервером:', err);
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
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              console.log('[TERMS] Принятие условий:', e.target.checked);
            }}
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
