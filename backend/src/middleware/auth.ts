import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/db';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { sub: string };
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    if (!rows[0]) return res.status(401).json({ error: 'Unauthorized' });
    (req as any).user = rows[0];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
