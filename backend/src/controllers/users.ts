import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';
import { reputationService } from '../services/reputation';

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query(
      'SELECT id, username, avatar_url, bio, stellar_address, credits, created_at FROM users WHERE id = $1',
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    const { bio, avatarUrl } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET bio=COALESCE($1,bio), avatar_url=COALESCE($2,avatar_url), updated_at=NOW() WHERE id=$3 RETURNING *',
      [bio, avatarUrl, req.params.id],
    );
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function getReputation(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query('SELECT stellar_address FROM users WHERE id = $1', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    const score = await reputationService.getScore(rows[0].stellar_address);
    res.json({ userId: req.params.id, score });
  } catch (e) {
    next(e);
  }
}
