'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
    }
  }

  return (
    <main className="login">
      <div className="card login-card">
        <h1>CISM Mentor</h1>
        <p className="muted">Log in met je e-mailadres. Je krijgt een inloglink toegestuurd.</p>
        {status === 'sent' ? (
          <p className="ok">Check je mailbox en klik op de link om in te loggen.</p>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              type="email"
              required
              placeholder="jij@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Versturen…' : 'Stuur inloglink'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="warn">{message}</p>}
      </div>
    </main>
  );
}
