import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';

export async function listBounties(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, category, limit = 20, offset = 0 } = req.query;
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      conditions.push(`b.status = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`b.category = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(Number(limit), Number(offset));
    const { rows } = await db.query(
      `SELECT b.*, u.username AS sponsor_username, u.avatar_url AS sponsor_avatar
       FROM bounties b JOIN users u ON b.sponsor_id = u.id
       ${where} ORDER BY b.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function getBounty(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await db.query(
      `SELECT b.*, u.username AS sponsor_username, u.avatar_url AS sponsor_avatar
       FROM bounties b JOIN users u ON b.sponsor_id = u.id WHERE b.id = $1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function createBounty(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { title, description, reward, currency, category, claimType, expiresAt } = req.body;
    const { rows } = await db.query(
      `INSERT INTO bounties (title, description, reward, currency, category, claim_type, sponsor_id, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, reward, currency, category, claimType, user.id, expiresAt],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function updateBounty(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { rows: existing } = await db.query('SELECT * FROM bounties WHERE id = $1', [
      req.params.id,
    ]);
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });
    if (existing[0].sponsor_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
    const { title, description, reward, status, expiresAt } = req.body;
    const { rows } = await db.query(
      `UPDATE bounties SET title=COALESCE($1,title), description=COALESCE($2,description),
       reward=COALESCE($3,reward), status=COALESCE($4,status), expires_at=COALESCE($5,expires_at),
       updated_at=NOW() WHERE id=$6 RETURNING *`,
      [title, description, reward, status, expiresAt, req.params.id],
    );
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function deleteBounty(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { rows } = await db.query('SELECT sponsor_id FROM bounties WHERE id = $1', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    if (rows[0].sponsor_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
    await db.query('DELETE FROM bounties WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
