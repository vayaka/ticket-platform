import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.header('Authorization');

    // Добавим лог для отладки
    console.log('Заголовок Authorization на сервере:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Нет токена, доступ запрещен' });
    }

    const token = authHeader.split(' ')[1];

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

    // Добавляем информацию о пользователе в запрос
    req.user = decoded;

    next();
  } catch (err) {
    console.error('Ошибка аутентификации:', err.message);
    res.status(401).json({ message: 'Токен недействителен' });
  }
};

export default auth;
