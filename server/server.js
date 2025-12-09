const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// SQLite
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error("Ошибка подключения:", err);
  else console.log("База данных SQLite подключена");
});

// Создание таблицы
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      level INTEGER DEFAULT 1,
      score INTEGER DEFAULT 0
    )
  `);
  console.log("Таблица users готова");
});

// Регистрация
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  console.log(`[REGISTER] Попытка регистрации: ${username}, ${email}`);

  const hashed = bcrypt.hashSync(password, 10);
  const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

  db.run(sql, [username, email, hashed], function (err) {
    if (err) {
      console.error(`[REGISTER] Ошибка: ${err.message}`);
      return res.status(400).json({ error: "Email или username заняты" });
    }

    console.log(`[REGISTER] Успешно зарегистрирован пользователь ID: ${this.lastID}`);
    res.json({ success: true, userId: this.lastID });
  });
});

// Вход
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(`[LOGIN] Попытка входа: ${email}`);

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error(`[LOGIN] Ошибка базы данных: ${err.message}`);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
    if (!user) {
      console.warn(`[LOGIN] Пользователь не найден: ${email}`);
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      console.warn(`[LOGIN] Неверный пароль: ${email}`);
      return res.status(400).json({ error: "Неверный пароль" });
    }

    console.log(`[LOGIN] Успешный вход: ${email}, ID: ${user.id}`);
    res.json({
      success: true,
      userId: user.id,
      username: user.username,
      email: user.email,
    });
  });
});

// Профиль
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  console.log(`[PROFILE] Запрос профиля пользователя ID: ${id}`);

  const sql = `SELECT username, email, level, score FROM users WHERE id = ?`;
  db.get(sql, [id], (err, user) => {
    if (err) {
      console.error(`[PROFILE] Ошибка базы данных: ${err.message}`);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
    if (!user) {
      console.warn(`[PROFILE] Пользователь не найден: ID ${id}`);
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    console.log(`[PROFILE] Данные пользователя: ${user.username}, уровень: ${user.level}, очки: ${user.score}`);
    res.json(user);
  });
});

// Старт сервера
app.listen(3001, () => {
  console.log("Сервер работает на http://localhost:3001");
});
