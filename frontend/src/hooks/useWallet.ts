'use client';

import { useState, useCallback } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const optRes = await fetch(`${API}/api/auth/passkey/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const options = await optRes.json();
      const credential = await startRegistration(options);
      const verifyRes = await fetch(`${API}/api/auth/passkey/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, credential }),
      });
      const { stellarAddress } = await verifyRes.json();
      setAddress(stellarAddress);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const optRes = await fetch(`${API}/api/auth/passkey/authenticate/options`);
      const options = await optRes.json();
      const credential = await startAuthentication(options);
      const verifyRes = await fetch(`${API}/api/auth/passkey/authenticate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const { stellarAddress } = await verifyRes.json();
      setAddress(stellarAddress);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { address, loading, error, register, authenticate };
}
