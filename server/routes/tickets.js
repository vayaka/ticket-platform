import express from 'express';
import Ticket from '../models/Ticket.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Настройка хранилища для загруженных файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar)$/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла'));
    }
  }
});

// Получить все заявки (с фильтрацией)
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, department, search } = req.query;
    const filter = {};

    // Базовые фильтры
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;

    // Поиск по тексту
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Для обычных пользователей показываем только их заявки
    if (req.user.role === 'user') {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      );
    }

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Получить заявку по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.createdBy', 'name')
      .populate('statusHistory.changedBy', 'name');

    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Создать новую заявку
router.post('/', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, category, priority, department, dueDate } = req.body;

    const attachments = req.files ? req.files.map(file => ({
      name: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype,
    })) : [];

    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      department,
      dueDate: dueDate || null,
      createdBy: req.user.id,
      attachments,
      statusHistory: [{
        status: 'new',
        changedBy: req.user.id,
        comment: 'Заявка создана'
      }]
    });

    const savedTicket = await ticket.save();
    await savedTicket.populate('createdBy', 'name');

    res.status(201).json(savedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Обновить заявку
router.put('/:id', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, category, priority, department, dueDate } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    // Проверка прав на редактирование
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Нет прав на редактирование этой заявки' });
    }

    // Обновление базовых полей
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.category = category || ticket.category;
    ticket.priority = priority || ticket.priority;
    ticket.department = department || ticket.department;
    ticket.dueDate = dueDate || ticket.dueDate;

    // Добавление новых вложений
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        size: file.size,
        type: file.mimetype,
      }));

      ticket.attachments = [...ticket.attachments, ...newAttachments];
    }

    const updatedTicket = await ticket.save();
    await updatedTicket.populate('createdBy', 'name');
    await updatedTicket.populate('assignedTo', 'name');

    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Изменить статус заявки
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, comment } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    // Проверка прав на изменение статуса
    if (req.user.role === 'user' && ticket.assignedTo?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Нет прав на изменение статуса этой заявки' });
    }

    // Обновление статуса
    ticket.status = status;

    // Добавление записи в историю статусов
    ticket.statusHistory.push({
      status,
      changedBy: req.user.id,
      comment: comment || `Статус изменен на "${status}"`,
    });

    const updatedTicket = await ticket.save();
    await updatedTicket.populate('createdBy', 'name');
    await updatedTicket.populate('assignedTo', 'name');

    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Назначить исполнителя
router.patch('/:id/assign', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Только админы и модераторы могут назначать исполнителей
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Нет прав на назначение исполнителя' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    ticket.assignedTo = userId;

    // Если заявка новая, меняем статус на "назначена"
    if (ticket.status === 'new') {
      ticket.status = 'assigned';

      // Добавление записи в историю статусов
      ticket.statusHistory.push({
        status: 'assigned',
        changedBy: req.user.id,
        comment: 'Назначен исполнитель'
      });
    }

    const updatedTicket = await ticket.save();
    await updatedTicket.populate('createdBy', 'name');
    await updatedTicket.populate('assignedTo', 'name');

    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Добавить комментарий
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const comment = {
      text,
      createdBy: req.user.id,
    };

    ticket.comments.push(comment);
    await ticket.save();

    // Получаем обновленную заявку с заполненными данными о пользователе
    const updatedTicket = await Ticket.findById(req.params.id)
      .populate('comments.createdBy', 'name');

    // Возвращаем только что добавленный комментарий
    const newComment = updatedTicket.comments[updatedTicket.comments.length - 1];

    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Удалить вложение
router.delete('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    // Проверка прав на редактирование
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Нет прав на редактирование этой заявки' });
    }

    // Найти вложение
    const attachment = ticket.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Вложение не найдено' });
    }

    // Удалить файл с диска
    if (attachment.path) {
      fs.unlink(attachment.path, (err) => {
        if (err) console.error('Ошибка при удалении файла:', err);
      });
    }

    // Удалить вложение из массива
    attachment.remove();
    await ticket.save();

    res.json({ message: 'Вложение удалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
