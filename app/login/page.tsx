'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'link'>('password');
  const [status, setStatus] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('busy');
    setMessage('');
    const supabase = createSupabaseBrowserClient();

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus('error');
        setMessage(
          /invalid login credentials/i.test(error.message)
            ? 'E-mailadres of wachtwoord klopt niet.'
            : error.message,
        );
        return;
      }
      window.location.href = '/';
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setMessage(
        /rate limit/i.test(error.message)
          ? 'Er zijn te veel inlogmails verstuurd. Wacht een uur of log in met je wachtwoord.'
          : error.message,
      );
    } else {
      setStatus('sent');
    }
  }

  return (
    <main className="login">
      <div className="card login-card">
        <h1>CISM Mentor</h1>
        {status === 'sent' ? (
          <p className="ok">Check je mailbox en klik op de nieuwste link om in te loggen.</p>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="jij@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode === 'password' && (
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <button type="submit" disabled={status === 'busy'}>
              {status === 'busy' ? 'Bezig…' : mode === 'password' ? 'Inloggen' : 'Stuur inloglink'}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setMode(mode === 'password' ? 'link' : 'password');
                setStatus('idle');
                setMessage('');
              }}
            >
              {mode === 'password' ? 'Liever een inloglink per mail' : 'Inloggen met wachtwoord'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="warn">{message}</p>}
      </div>
    </main>
  );
}
