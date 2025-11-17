import express from 'express'
import cors from 'cors'
import authRouter from './auth/auth.controller'
import tasksRouter from './tasks/tasks.controller'
import cookieParser from "cookie-parser";



const app = express()
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true
}));
app.use(cookieParser());
app.use(express.json())

// Correct routes
app.use('/api/users', authRouter)
app.use('/api/tasks', tasksRouter)

app.use((req, res) => res.status(404).json({ message: 'Not found' }))

export default app
