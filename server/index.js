const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для загрузок
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршруты (создадим позже)
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Что-то пошло не так!' });
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Подключено к MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));
