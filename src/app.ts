import express from 'express';
import http from 'http';
import indexRouter from './routes/index';
import { initializeDatabase } from './db/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Увеличиваем лимиты для JSON и URL-encoded данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    // Подключаем роуты
    app.use('/metrics', indexRouter);

    // Создаем HTTP сервер с настройками
    const server = http.createServer(app);
    
    // Увеличиваем максимальное количество соединений
    server.maxConnections = 50000; // Значение можно регулировать
    
    // Настраиваем keep-alive
    server.keepAliveTimeout = 160000; // 60 секунд
    server.headersTimeout = 165000; // Должен быть больше keepAliveTimeout

    // Middleware для отслеживания соединений
    app.use((req, res, next) => {
      console.log(`Active connections: ${server.connections}/${server.maxConnections}`);
      next();
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        connections: server.connections,
        memoryUsage: process.memoryUsage()
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Max connections: ${server.maxConnections}`);
    });

    // Обработка ошибок сервера
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();

export default app;