"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshTokens = exports.loginUser = exports.registerUser = void 0;
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessSecret = process.env.JWT_ACCESS_SECRET || '';
const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
const accessExpiry = Number(process.env.ACCESS_TOKEN_EXPIRES_IN || 900);
const refreshExpiry = Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 604800);
const registerUser = async (email, password, name) => {
    const existing = await db_1.default.user.findUnique({ where: { email } });
    if (existing)
        throw { status: 400, message: 'Email already in use' };
    const hashed = await bcrypt_1.default.hash(password, 10);
    const user = await db_1.default.user.create({ data: { email, password: hashed, name } });
    return { id: user.id, email: user.email, name: user.name };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await db_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw { status: 401, message: 'Invalid credentials' };
    const ok = await bcrypt_1.default.compare(password, user.password);
    if (!ok)
        throw { status: 401, message: 'Invalid credentials' };
    const access = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, accessSecret, { expiresIn: accessExpiry });
    const refresh = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, refreshSecret, { expiresIn: refreshExpiry });
    await db_1.default.user.update({ where: { id: user.id }, data: { refreshToken: refresh } });
    return { access, refresh, user: { id: user.id, email: user.email, name: user.name } };
};
exports.loginUser = loginUser;
const refreshTokens = async (token) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, refreshSecret);
        const user = await db_1.default.user.findUnique({ where: { id: payload.id } });
        if (!user || user.refreshToken !== token)
            throw { status: 401, message: 'Invalid refresh token' };
        const access = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, accessSecret, { expiresIn: accessExpiry });
        return { access };
    }
    catch {
        throw { status: 401, message: 'Invalid refresh token' };
    }
};
exports.refreshTokens = refreshTokens;
const logoutUser = async (userId) => {
    await db_1.default.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
exports.logoutUser = logoutUser;
