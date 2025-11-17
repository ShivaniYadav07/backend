"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessSecret = process.env.JWT_ACCESS_SECRET || '';
function authenticate(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token)
        return res.status(401).json({ message: 'Missing token' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, accessSecret);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
