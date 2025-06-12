import { Router, Request, Response } from 'express';
import { setMetrics } from '../repository/metrics';

const router = Router();

const setMetricsHandler = async (req: Request, res: Response): Promise<void> => {
    // console.log('POST /metrics request received', {
    //     body: req.body,
    //     headers: req.headers,
    //     ip: req.ip
    // });

    try {
        // 1. Получаем metric из тела запроса
        const { metric } = req.body;
        // console.log(`Processing metric value: ${metric}`);

        // 2. Проверяем, что metric есть и это число
        if (typeof metric !== 'number' || isNaN(metric)) {
            const errorMsg = `Invalid metric value. Expected number, received: ${typeof metric}`;
            console.warn(errorMsg);
            
            res.status(400).json({ 
                error: 'Invalid metric value. Expected number.',
                received: typeof metric === 'number' ? metric : typeof metric
            });
            return;
        }

        // 3. Вызываем функцию сохранения метрики
        // console.log('Attempting to save metric to database...');
        const success = await setMetrics(metric);
        // console.log(`Save operation result: ${success}`);

        // 4. Возвращаем соответствующий ответ
        if (success) {
            // console.log(`Metric ${metric} saved successfully`);
            res.status(201).json({
                success: true,
                message: 'Metric saved successfully',
                metric
            });
        } else {
            console.error('Failed to save metric to database');
            res.status(500).json({
                success: false,
                error: 'Failed to save metric'
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const stackTrace = error instanceof Error ? error.stack : undefined;
        
        console.error('Error in setMetricsHandler:', {
            error: errorMessage,
            stack: stackTrace,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: errorMessage
        });
    } finally {
        // console.log(`Request processing completed at ${new Date().toISOString()}`);
    }
};

router.post('/', setMetricsHandler);

export default router;