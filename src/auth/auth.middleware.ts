import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_ACCESS_SECRET || ''

export default function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, accessSecret) as { id: number; email: string };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
