import express from 'express';
import cors from 'cors';
import authRouter from './auth/auth.controller';
import tasksRouter from './tasks/tasks.controller';
import cookieParser from 'cookie-parser';

const app = express();

// Define allowed origins (add localhost if you need it for local dev/testing)
const allowedOrigins = [
  'https://frontend-six-weld-32.vercel.app',
  // Uncomment/add if testing locally: 'http://localhost:3000'
];

// Apply CORS to ALL routes (not just OPTIONS). This must come BEFORE your routes.
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,  // Allows cookies/auth headers
}));

// Other middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/users', authRouter);
app.use('/api/tasks', tasksRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

export default app;