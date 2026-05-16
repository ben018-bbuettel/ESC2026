import React, { useState } from 'react';
import { supabase } from '../supabase';

const ALL_RANKS = Array.from({ length: 26 }, (_, i) => i + 1);

export default function AdminPage({ countries, results, onSave }) {
  const [rankAssign, setRankAssign] = useState(() => {
    const init = {};
    results.forEach(r => { init[r.actual_rank] = r.country; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const usedCountries = Object.values(rankAssign);

  function assign(rank, country) {
    setRankAssign(prev => {
      const updated = { ...prev };
      // Remove country if already assigned to another rank
      Object.entries(updated).forEach(([r, c]) => {
        if (c === country && Number(r) !== rank) delete updated[r];
      });
      if (country === '') delete updated[rank];
      else updated[rank] = country;
      return updated;
    });
  }

  const allFilled = ALL_RANKS.every(r => rankAssign[r]);

  async function saveResults() {
    if (!allFilled) return;
    setSaving(true);
    setError('');
    try {
      // Delete existing results
      await supabase.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new results
      const rows = Object.entries(rankAssign).map(([rank, country]) => ({
        country,
        actual_rank: Number(rank),
      }));
      const { error: e } = await supabase.from('results').insert(rows);
      if (e) throw e;
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSave(); }, 1500);
    } catch (e) {
      setError(e.message || 'Fehler beim Speichern');
    }
    setSaving(false);
  }

  const getGroup = (rank) => {
    if (rank <= 10) return { label: 'Top 10', color: '#FFD700' };
    if (rank <= 18) return { label: '11–18', color: '#A78BFA' };
    return { label: '19–26', color: '#60A5FA' };
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-badge">🔧 Admin</div>
        <h2>ESC Ergebnisse eintragen</h2>
        <p>Trage nach dem Finale die echten Platzierungen ein. Danach wird der Sieger berechnet!</p>
      </div>

      <div className="admin-progress">
        <div className="progress-bar-outer">
          <div
            className="progress-bar-inner"
            style={{ width: `${(Object.keys(rankAssign).length / 26) * 100}%` }}
          />
        </div>
        <span className="progress-text">{Object.keys(rankAssign).length} / 26 eingetragen</span>
      </div>

      <div className="admin-grid">
        {ALL_RANKS.map(rank => {
          const group = getGroup(rank);
          return (
            <div key={rank} className="admin-row">
              <div className="admin-rank" style={{ color: group.color, borderColor: group.color + '55' }}>
                <span className="rank-num">{rank}.</span>
                <span className="rank-group-label">{group.label}</span>
              </div>
              <select
                className="country-select"
                value={rankAssign[rank] || ''}
                onChange={e => assign(rank, e.target.value)}
                style={{ borderColor: rankAssign[rank] ? group.color + '88' : undefined }}
              >
                <option value="">— Land wählen —</option>
                {countries.sort((a, b) => a.name.localeCompare(b.name)).map(c => {
                  const usedElsewhere = usedCountries.includes(c.name) && rankAssign[rank] !== c.name;
                  return (
                    <option key={c.name} value={c.name} disabled={usedElsewhere}>
                      {usedElsewhere ? '✗ ' : ''}{c.flag} {c.name}
                    </option>
                  );
                })}
              </select>
              {rankAssign[rank] && (
                <span className="admin-flag">
                  {countries.find(c => c.name === rankAssign[rank])?.flag}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">✅ Gespeichert! Berechne Rangliste...</div>}

      <div className="admin-actions">
        <button
          className="btn-primary"
          disabled={!allFilled || saving}
          onClick={saveResults}
        >
          {saving ? '⏳ Speichern...' : '🏆 Ergebnisse speichern & Sieger ermitteln'}
        </button>
        {!allFilled && (
          <p className="hint-text">Noch {26 - Object.keys(rankAssign).length} Plätze fehlen</p>
        )}
      </div>
    </div>
  );
}
