import prisma from '../db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_ACCESS_SECRET || ''
const refreshSecret = process.env.JWT_REFRESH_SECRET || ''
const accessExpiry = Number(process.env.ACCESS_TOKEN_EXPIRES_IN || 900)
const refreshExpiry = Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 604800)

export const registerUser = async (email: string, password: string, name?: string) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw { status: 400, message: 'Email already in use' }
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hashed, name } })
  return { id: user.id, email: user.email, name: user.name }
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw { status: 401, message: 'Invalid credentials' }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw { status: 401, message: 'Invalid credentials' }
  const access = jwt.sign({ id: user.id, email: user.email }, accessSecret, { expiresIn: accessExpiry })
  const refresh = jwt.sign({ id: user.id, email: user.email }, refreshSecret, { expiresIn: refreshExpiry })
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refresh } })
  return { access, refresh, user: { id: user.id, email: user.email, name: user.name } }
}

export const refreshTokens = async (token: string) => {
  try {
    const payload = jwt.verify(token, refreshSecret) as { id: number }
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user || user.refreshToken !== token) throw { status: 401, message: 'Invalid refresh token' }
    const access = jwt.sign({ id: user.id, email: user.email }, accessSecret, { expiresIn: accessExpiry })
    return { access }
  } catch {
    throw { status: 401, message: 'Invalid refresh token' }
  }
}

export const logoutUser = async (userId: number) => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } })
}
