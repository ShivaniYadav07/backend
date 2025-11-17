import express from 'express';
import cors from 'cors';
import authRouter from './auth/auth.controller';
import tasksRouter from './tasks/tasks.controller';
import cookieParser from 'cookie-parser';

const app = express();

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://frontend-six-weld-32.vercel.app']
  : ['http://localhost:3000', 'https://frontend-six-weld-32.vercel.app'];

console.log('CORS allowed origins:', allowedOrigins); // Debug log

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ Rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/users', authRouter);
app.use('/api/tasks', tasksRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

export default app;