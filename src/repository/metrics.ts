import { getDatabase } from "../db/database";


export async function  setMetrics(metric: number):Promise<boolean>{
try {
        const db = getDatabase();
        
        // Выполняем INSERT запрос
        const insertResult = await db.query(
            'INSERT INTO metrics (metric) VALUES ($1)',
            [metric]
        );
        const success = insertResult.rowCount != null && insertResult.rowCount > 0;
        if (success) {
            // console.warn(`Successfully inserted metric: ${metric}`);
        } else {
            console.warn(`No rows were inserted for metric: ${metric}`);
        }
        
        // Проверяем, что хотя бы одна строка была добавлена
        // Для PostgreSQL insertResult.rowCount содержит количество измененных строк
        return  success;
        
    } catch (error) {
        console.error('Database error:', error);
        return false;
    }
} 