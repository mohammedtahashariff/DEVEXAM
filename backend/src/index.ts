import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow development frontend
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Root
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dev Exam Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints ready at http://localhost:${PORT}/api`);
});
