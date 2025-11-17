"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_controller_1 = __importDefault(require("./auth/auth.controller"));
const tasks_controller_1 = __importDefault(require("./tasks/tasks.controller"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://frontend-six-weld-32.vercel.app']
    : ['http://localhost:3000', 'https://frontend-six-weld-32.vercel.app'];
console.log('CORS allowed origins:', allowedOrigins); // Debug log
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Allowed origin:', origin);
            callback(null, true);
        }
        else {
            console.log('❌ Rejected origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/users', auth_controller_1.default);
app.use('/api/tasks', tasks_controller_1.default);
// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
exports.default = app;
