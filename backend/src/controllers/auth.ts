import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { db } from '../services/db';

const JWT_SECRET = process.env.JWT_SECRET!;
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'OrbitWork';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

function issueToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function githubCallback(req: Request, res: Response) {
  const user = req.user as any;
  const token = issueToken(user.id);
  res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
}

// In-memory challenge store (use Redis in production)
const challenges = new Map<string, string>();

export async function passkeyRegisterOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.body;
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: username,
      userName: username,
      attestationType: 'none',
    });
    challenges.set(username, options.challenge);
    res.json(options);
  } catch (e) {
    next(e);
  }
}

export async function passkeyRegisterVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, credential } = req.body;
    const expectedChallenge = challenges.get(username);
    if (!expectedChallenge) return res.status(400).json({ error: 'No challenge found' });
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
    if (!verification.verified) return res.status(400).json({ error: 'Verification failed' });
    const { rows } = await db.query(
      `INSERT INTO users (username, passkey_credential_id, passkey_public_key)
       VALUES ($1,$2,$3) ON CONFLICT (username) DO UPDATE SET updated_at=NOW() RETURNING *`,
      [
        username,
        Buffer.from(verification.registrationInfo!.credentialID).toString('base64url'),
        Buffer.from(verification.registrationInfo!.credentialPublicKey).toString('base64url'),
      ],
    );
    challenges.delete(username);
    res.json({ token: issueToken(rows[0].id), stellarAddress: rows[0].stellar_address });
  } catch (e) {
    next(e);
  }
}

export async function passkeyAuthOptions(_req: Request, res: Response, next: NextFunction) {
  try {
    const options = await generateAuthenticationOptions({ rpID: RP_ID });
    challenges.set('__auth__', options.challenge);
    res.json(options);
  } catch (e) {
    next(e);
  }
}

export async function passkeyAuthVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential } = req.body;
    const expectedChallenge = challenges.get('__auth__');
    if (!expectedChallenge) return res.status(400).json({ error: 'No challenge found' });
    const { rows } = await db.query('SELECT * FROM users WHERE passkey_credential_id = $1', [
      credential.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: Buffer.from(rows[0].passkey_credential_id, 'base64url'),
        credentialPublicKey: Buffer.from(rows[0].passkey_public_key, 'base64url'),
        counter: rows[0].passkey_counter || 0,
      },
    });
    if (!verification.verified) return res.status(400).json({ error: 'Verification failed' });
    await db.query('UPDATE users SET passkey_counter=$1 WHERE id=$2', [
      verification.authenticationInfo.newCounter,
      rows[0].id,
    ]);
    challenges.delete('__auth__');
    res.json({ token: issueToken(rows[0].id), stellarAddress: rows[0].stellar_address });
  } catch (e) {
    next(e);
  }
}

export function refreshToken(req: Request, res: Response) {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    res.json({ token: issueToken(payload.sub) });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function logout(_req: Request, res: Response) {
  res.status(204).send();
}
