import express from 'express'
import { Request } from 'express'
import prisma from '../db'
import authenticate from '../auth/auth.middleware'
const router = express.Router()


router.use(authenticate)

router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user!.id
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.min(100, Number(req.query.limit || 10))
    const status = req.query.status as string | undefined
    const q = req.query.q as string | undefined
    const where: any = { userId }
    if (status) where.status = status
    if (q) where.title = { contains: q, mode: 'insensitive' }
    const total = await prisma.task.count({ where })
    const tasks = await prisma.task.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } })
    res.json({ page, limit, total, tasks })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  try {
   const userId = (req as any).user!.id
    const { title, description } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })
    const task = await prisma.task.create({ data: { title, description, userId } })
    res.status(201).json({ task })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user!.id
    const id = Number(req.params.id)
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.userId !== userId) return res.status(404).json({ message: 'Not found' })
    res.json({ task })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const userId = (req as any).user!.id
    const id = Number(req.params.id)
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.userId !== userId) return res.status(404).json({ message: 'Not found' })
    const { title, description, status } = req.body
    const updated = await prisma.task.update({ where: { id }, data: { title: title ?? task.title, description: description ?? task.description, status: status ?? task.status } })
    res.json({ task: updated })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user!.id
    const id = Number(req.params.id)
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.userId !== userId) return res.status(404).json({ message: 'Not found' })
    await prisma.task.delete({ where: { id } })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/:id/toggle', async (req, res) => {
  try {
    const userId = (req as any).user!.id
    const id = Number(req.params.id)
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.userId !== userId) return res.status(404).json({ message: 'Not found' })
    const next = task.status === 'done' ? 'pending' : 'done'
    const updated = await prisma.task.update({ where: { id }, data: { status: next } })
    res.json({ task: updated })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
