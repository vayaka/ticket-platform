<<<<<<< HEAD
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
=======
// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb

// Авторизация пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    // Отправляем данные пользователя без пароля
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token
    };

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Выход (логаут)
router.post('/logout', (req, res) => {
  // JWT токены не требуют сервера для invalidation,
  // но здесь можно добавить логику для blacklist токенов при необходимости
  res.json({ message: 'Выход выполнен успешно' });
});

// Проверка текущей сессии
router.get('/me', async (req, res) => {
  try {
    // Получаем токен из заголовка
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

    // Получаем пользователя
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Недействительный токен' });
  }
});

<<<<<<< HEAD
export default router;
=======
module.exports = router;
>>>>>>> b8b05b5823c513c118c1f27eaa4c623ce0d255eb
