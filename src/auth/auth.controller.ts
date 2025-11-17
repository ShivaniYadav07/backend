import express from 'express'
import * as svc from './auth.service'
const router = express.Router()

// Register और Login unchanged
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
    const user = await svc.registerUser(email, password, name)
    res.status(201).json({ user })
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' })
  }
})

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
      secure: false, // true for HTTPS
      sameSite: "strict",
      maxAge: 1000 * 60 * 15 // 15 min
    });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.json({ user });

  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refresh = req.cookies.refreshToken;  // यह change करें
    if (!refresh) return res.status(401).json({ message: 'Missing refresh token' })  // 400 से 401 करें
    
    const { access } = await svc.refreshTokens(refresh);
    
    // नया access token cookie में set करें
    res.cookie("accessToken", access, {
      httpOnly: true,
      secure: false,  // true for HTTPS
      sameSite: "strict",
      maxAge: 1000 * 60 * 15
    });
    
    res.json({ message: 'Token refreshed' });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
});

import authenticate from './auth.middleware';  

router.post('/logout', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    await svc.logoutUser(userId);
    
    // Cookies clear करें
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ ok: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
});

export default router