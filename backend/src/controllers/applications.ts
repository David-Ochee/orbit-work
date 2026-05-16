import { Request, Response, NextFunction } from 'express';
import { db } from '../services/db';

export async function listApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const { bountyId } = req.query;
    const params: unknown[] = [];
    const where = bountyId ? (params.push(bountyId), `WHERE a.bounty_id = $1`) : '';
    const { rows } = await db.query(
      `SELECT a.*, u.username AS applicant_username FROM applications a
       JOIN users u ON a.applicant_id = u.id ${where} ORDER BY a.created_at DESC`,
      params,
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function createApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { bountyId, proposal } = req.body;
    const { rows: creditRows } = await db.query(
      'UPDATE users SET credits = credits - 1 WHERE id = $1 AND credits > 0 RETURNING credits',
      [user.id],
    );
    if (!creditRows[0]) return res.status(402).json({ error: 'Insufficient credits' });
    const { rows } = await db.query(
      `INSERT INTO applications (bounty_id, applicant_id, proposal) VALUES ($1,$2,$3) RETURNING *`,
      [bountyId, user.id, proposal],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows: existing } = await db.query('SELECT * FROM applications WHERE id = $1', [
      req.params.id,
    ]);
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });
    const { status, proposal } = req.body;
    const { rows } = await db.query(
      `UPDATE applications SET status=COALESCE($1,status), proposal=COALESCE($2,proposal),
       updated_at=NOW() WHERE id=$3 RETURNING *`,
      [status, proposal, req.params.id],
    );
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}
