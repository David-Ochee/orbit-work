import { Router } from 'express';
import passport from 'passport';
import * as ctrl from '../controllers/auth';

const router = Router();

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  ctrl.githubCallback,
);

// Passkey (WebAuthn)
router.post('/passkey/register/options', ctrl.passkeyRegisterOptions);
router.post('/passkey/register/verify', ctrl.passkeyRegisterVerify);
router.get('/passkey/authenticate/options', ctrl.passkeyAuthOptions);
router.post('/passkey/authenticate/verify', ctrl.passkeyAuthVerify);

// Token refresh
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);

export default router;
