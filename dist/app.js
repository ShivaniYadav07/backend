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
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // frontend URL
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Correct routes
app.use('/api/users', auth_controller_1.default);
app.use('/api/tasks', tasks_controller_1.default);
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
exports.default = app;
