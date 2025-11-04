'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Row = {
  user_id: string;
  points_month: number;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase.from('leaderboard_current').select('*');
      if (error) {
        console.error('Error loading leaderboard:', error);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: 'system-ui' }}>
        <h2 style={{ color: '#C8102E' }}>Lade Ranking...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h2 style={{ color: '#C8102E' }}>🏆 Ranking - aktueller Monat</h2>
      <ol>
        {rows.map((r, i) => (
          <li key={r.user_id || i}>
            #{i + 1} - {String(r.user_id || '').slice(0, 8)} - {r.points_month} Punkte
          </li>
        ))}
      </ol>
      <p style={{ opacity: 0.8 }}>
        <a href="/" style={{ color: '#C8102E', textDecoration: 'none' }}>
          ← Zurueck
        </a>
      </p>
    </div>
  );
}