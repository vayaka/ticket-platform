const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const dotenv = require('dotenv');

dotenv.config();

const initDatabase = async () => {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Подключено к MongoDB');

    // Очистка существующих данных
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Существующие данные удалены');

    // Создание тестовых пользователей
    const admin = new User({
      name: 'Администратор',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT'
    });

    const moderator = new User({
      name: 'Иван Иванов',
      email: 'moderator@example.com',
      password: 'moderator123',
      role: 'moderator',
      department: 'IT'
    });

    const user = new User({
      name: 'Пётр Петров',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      department: 'Бухгалтерия'
    });

    // Сохранение пользователей
    const savedAdmin = await admin.save();
    const savedModerator = await moderator.save();
    const savedUser = await user.save();
    console.log('Тестовые пользователи созданы');

    // Создание тестовых заявок
    const tickets = [
      {
        title: 'Поломка принтера',
        description: 'Принтер не печатает, замятие бумаги в лотке 2',
        status: 'new',
        priority: 'high',
        category: 'hardware',
        department: 'IT',
        createdBy: savedUser._id,
        statusHistory: [{
          status: 'new',
          changedBy: savedUser._id,
          comment: 'Заявка создана'
        }]
      },
      {
        title: 'Не работает интернет',
        description: 'Подключение отсутствует в кабинете 305, маршрутизатор постоянно перезагружается',
        status: 'new',
        priority: 'critical',
        category: 'network',
        department: 'IT',
        createdBy: savedUser._id,
        statusHistory: [{
          status: 'new',
          changedBy: savedUser._id,
          comment: 'Заявка создана'
        }]
      },
      {
        title: 'Проблемы с кондиционером',
        description: 'Кондиционер не охлаждает, странный шум при работе в кабинете директора',
        status: 'in-progress',
        priority: 'medium',
        category: 'maintenance',
        department: 'Техническое обслуживание',
        createdBy: savedAdmin._id,
        assignedTo: savedModerator._id,
        comments: [{
          text: 'Выезд специалиста запланирован на 14:00 сегодня',
          createdBy: savedModerator._id,
        }],
        statusHistory: [
          {
            status: 'new',
            changedBy: savedAdmin._id,
            comment: 'Заявка создана'
          },
          {
            status: 'assigned',
            changedBy: savedAdmin._id,
            comment: 'Назначен исполнитель'
          },
          {
            status: 'in-progress',
            changedBy: savedModerator._id,
            comment: 'Заявка взята в работу'
          }
        ]
      }
    ];

    // Сохранение заявок
    await Ticket.insertMany(tickets);
    console.log('Тестовые заявки созданы');

    console.log('Инициализация базы данных завершена успешно');
    mongoose.disconnect();
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

initDatabase();
