const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// Получить всех пользователей (только для админов)
router.get('/', auth, async (req, res) => {
  try {
    // Проверка прав доступа
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получить пользователя по ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Проверка прав доступа
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получить заявки пользователя
router.get('/:id/tickets', auth, async (req, res) => {
  try {
    // Проверка прав доступа
    if (req.user.role === 'user' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Поиск заявок
    const tickets = await Ticket.find({
      $or: [
        { createdBy: req.params.id },
        { assignedTo: req.params.id }
      ]
    })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновить информацию о пользователе
router.put('/:id', auth, async (req, res) => {
  try {
    // Проверка прав доступа
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const { name, email, department, role } = req.body;

    // Только админ может менять роль
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав для изменения роли' });
    }

    const updateData = { name, email, department };
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
