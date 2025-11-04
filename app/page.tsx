'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../libe/superbase';

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [steps, setSteps] = useState<number>(0);

  const goal = 10000;
  const percent = Math.min(100, Math.round((steps / goal) * 100));
  const today = new Date().toISOString().slice(0, 10);

  // Session-Status prüfen
  useEffect(() => {
    superbase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Login mit Magic Link
  async function signIn() {
    const { error } = await superbase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) alert(error.message);
    else alert('Magic Link gesendet ✅ – check deine E-Mail!');
  }

  // Schritte speichern
  async function saveSteps() {
    if (!session?.user?.id) {
      alert('Bitte zuerst einloggen.');
      return;
    }
    const base =
      steps >= 15000 ? 15 : steps >= 10000 ? 10 : steps >= 5000 ? 5 : 0;

    await supabase.from('steps_daily').upsert({
      user_id: session.user.id,
      date: today,
      steps,
      points_base: base,
      multiplier: 1.0,
      delivered: steps >= goal,
    });

    if (steps >= goal) {
      await supabase
        .from('calendar_days')
        .upsert({ user_id: session.user.id, date: today, reached: true });
    }

    alert('Gespeichert ✅');
  }

  const [quote, setQuote] = useState<{ spruch: string; autor: string | null } | null>(null);
  useEffect(() => {
    supabase
      .from('motivations')
      .select('spruch, autor')
      .eq('aktiv', true)
      .then(({ data }) => {
        if (data && data.length) {
          setQuote(data[Math.floor(Math.random() * data.length)] as any);
        }
      });
  }, []);

  // LOGIN-SCREEN
  if (!session) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'system-ui' }}>
        <h1 style={{ color: '#C8102E', marginBottom: 8 }}>RELOAD</h1>
        {quote && (
          <p style={{ fontStyle: 'italic', opacity: 0.8 }}>
            „{quote.spruch}“ {quote.autor ? `— ${quote.autor}` : ''}
          </p>
        )}
        <p>Login via Magic Link</p>
        <input
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            background: '#111',
            border: '1px solid #444',
            color: '#fff',
          }}
        />
        <div style={{ height: 8 }} />
        <button
          onClick={signIn}
          style={{
            background: '#C8102E',
            color: '#fff',
            border: 0,
            padding: '10px 14px',
            borderRadius: 8,
          }}
        >
          Link senden
        </button>
      </div>
    );
  }

  // HAUPTSCREEN (nach Login)
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#C8102E' }}>RELOAD</h1>
      {quote && (
        <p style={{ fontStyle: 'italic', opacity: 0.8 }}>
          „{quote.spruch}“ {quote.autor ? `— ${quote.autor}` : ''}
        </p>
      )}
      <p>Heute: {today}</p>

      <label>Schritte heute</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
          style={{
            padding: 10,
            borderRadius: 8,
            background: '#111',
            border: '1px solid #444',
            color: '#fff',
          }}
        />
        <button
          onClick={saveSteps}
          style={{
            background: '#C8102E',
            color: '#fff',
            border: 0,
            padding: '10px 14px',
            borderRadius: 8,
          }}
        >
          Speichern
        </button>
      </div>

      <div
        style={{
          marginTop: 16,
          background: '#2A2A2A',
          borderRadius: 12,
          height: 18,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: percent >= 100 ? '#00FF66' : '#C8102E',
            transition: 'width .6s',
          }}
        />
      </div>
      <p style={{ opacity: 0.8 }}>
        {steps} / {goal} Schritte ({percent}%)
      </p>

      <p style={{ opacity: 0.8 }}>
        <a href="/leaderboard" style={{ color: '#C8102E', textDecoration: 'none' }}>
          → Zum Monats-Ranking
        </a>
      </p>
    </div>
  );
}
