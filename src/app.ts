import express from 'express'
import cors from 'cors'
import authRouter from './auth/auth.controller'
import tasksRouter from './tasks/tasks.controller'
import cookieParser from "cookie-parser";



const app = express()
const allowedOrigins = [
  "https://frontend-six-weld-32.vercel.app" // production frontend
];
// Handle preflight requests
app.options('*', cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


app.use(cookieParser());
app.use(express.json())

// Correct routes
app.use('/api/users', authRouter)
app.use('/api/tasks', tasksRouter)

app.use((req, res) => res.status(404).json({ message: 'Not found' }))

export default app
