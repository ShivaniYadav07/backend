"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const svc = __importStar(require("./auth.service"));
const router = express_1.default.Router();
// Register और Login unchanged
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Missing fields' });
        const user = await svc.registerUser(email, password, name);
        res.status(201).json({ user });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }
        const { user, access, refresh } = await svc.loginUser(email, password);
        // Cookies set (unchanged)
        res.cookie("accessToken", access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 1000 * 60 * 15 // 15 min
        });
        res.cookie("refreshToken", refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });
        res.json({ user });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const refresh = req.cookies.refreshToken; // यह change करें
        if (!refresh)
            return res.status(401).json({ message: 'Missing refresh token' }); // 400 से 401 करें
        const { access } = await svc.refreshTokens(refresh);
        // नया access token cookie में set करें
        res.cookie("accessToken", access, {
            httpOnly: true,
            secure: false, // true for HTTPS
            sameSite: "strict",
            maxAge: 1000 * 60 * 15
        });
        res.json({ message: 'Token refreshed' });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
});
const auth_middleware_1 = __importDefault(require("./auth.middleware"));
router.post('/logout', auth_middleware_1.default, async (req, res) => {
    try {
        const userId = req.user.id;
        await svc.logoutUser(userId);
        // Cookies clear करें
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ ok: true });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
});
exports.default = router;
