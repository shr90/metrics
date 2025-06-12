import { Pool, PoolClient, QueryResult } from 'pg';

// Интерфейс для нашей базы данных
export interface AppDatabase {
  query: (text: string, params?: any[]) => Promise<QueryResult>;
  getClient: () => Promise<PoolClient>;
}

let pool: Pool | null = null;

export async function initializeDatabase(): Promise<AppDatabase> {
    if (!pool) {
        try {
            pool = new Pool({
                user: process.env.PG_USER || 'postgres',
                host: process.env.PG_HOST || 'localhost',
                database: process.env.PG_DATABASE || 'mydatabase',
                password: process.env.PG_PASSWORD || 'mysecretpassword',
                port: parseInt(process.env.PG_PORT || '5432'),
                max: 20, // максимальное количество клиентов в пуле
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Проверяем соединение
            const client = await pool.connect();
            try {
                // Создаем таблицу если ее нет
                await client.query(`
                    CREATE TABLE IF NOT EXISTS metrics (
                        id SERIAL PRIMARY KEY,
                        metric DOUBLE PRECISION NOT NULL,
                        datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                console.log('PostgreSQL database initialized successfully');
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('PostgreSQL initialization failed:', error);
            throw error;
        }
    }
    
    return {
        query: (text: string, params?: any[]) => pool!.query(text, params),
        getClient: () => pool!.connect(),
    };
}

export function getDatabase(): AppDatabase {
    if (!pool) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return {
        query: (text: string, params?: any[]) => pool!.query(text, params),
        getClient: () => pool!.connect(),
    };
}

// Функция для закрытия соединений (вызывать при завершении приложения)
export async function closeDatabase(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('PostgreSQL connection pool closed');
    }
}