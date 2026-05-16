import React, { useState } from 'react';
import { supabase } from '../supabase';

const GROUPS = [
  { key: 'top10', label: 'Top 10', emoji: '🥇', desc: 'Platz 1–10', ranks: Array.from({ length: 10 }, (_, i) => i + 1), color: '#FFD700' },
  { key: 'mid', label: 'Plätze 11–18', emoji: '🥈', desc: 'Platz 11–18', ranks: Array.from({ length: 8 }, (_, i) => i + 11), color: '#A78BFA' },
  { key: 'lower', label: 'Plätze 19–25', emoji: '🥉', desc: 'Platz 19–25', ranks: Array.from({ length: 7 }, (_, i) => i + 19), color: '#60A5FA' },
];

export default function TippPage({ countries, onDone }) {
  const [step, setStep] = useState('name'); // name | tipp | confirm | done
  const [name, setName] = useState('');
  const [groupIdx, setGroupIdx] = useState(0);
  const [assignments, setAssignments] = useState({}); // { rank: countryName }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentGroup = GROUPS[groupIdx];
  const groupCountries = getGroupCountries(countries, currentGroup.key);

  function getGroupCountries(countries, groupKey) {
    // Countries are pre-divided by count: first 10 = top, next 8 = mid, last 8 = lower
    // But we let users assign any country to any rank WITHIN each group
    // Split countries into 3 buckets for assignment
    const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name));
    if (groupKey === 'top10') return sorted;
    if (groupKey === 'mid') return sorted;
    if (groupKey === 'lower') return sorted;
    return sorted;
  }

  // Get assigned countries for current group's ranks
  const currentAssignments = Object.fromEntries(
    Object.entries(assignments).filter(([rank]) => currentGroup.ranks.includes(Number(rank)))
  );
  const assignedCountriesInGroup = Object.values(currentAssignments);
  const usedCountriesAll = Object.values(assignments);

  const isGroupComplete = currentGroup.ranks.every(r => assignments[r]);

  function assignCountry(rank, country) {
    setAssignments(prev => {
      const updated = { ...prev };
      // Remove if already used in this group
      Object.entries(updated).forEach(([r, c]) => {
        if (c === country && currentGroup.ranks.includes(Number(r))) {
          delete updated[r];
        }
      });
      if (country === '') {
        delete updated[rank];
      } else {
        updated[rank] = country;
      }
      return updated;
    });
  }

  function nextGroup() {
    if (groupIdx < GROUPS.length - 1) setGroupIdx(g => g + 1);
    else setStep('confirm');
  }

  function prevGroup() {
    if (groupIdx > 0) setGroupIdx(g => g - 1);
  }

  async function submitTipps() {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      // Create participant
      const { data: participant, error: pErr } = await supabase
        .from('participants')
        .insert({ name: name.trim() })
        .select()
        .single();
      if (pErr) throw pErr;

      // Determine category per rank
      const tipRows = Object.entries(assignments).map(([rank, country]) => {
        const r = Number(rank);
        let category = 'lower';
        if (r <= 10) category = 'top10';
        else if (r <= 18) category = 'mid';
        return {
          participant_id: participant.id,
          country,
          predicted_rank: r,
          category,
        };
      });

      const { error: tErr } = await supabase.from('tips').insert(tipRows);
      if (tErr) throw tErr;

      setStep('done');
    } catch (e) {
      setError(e.message || 'Fehler beim Speichern. Bitte erneut versuchen.');
    }
    setSaving(false);
  }

  if (step === 'name') {
    return (
      <div className="tipp-page">
        <div className="tipp-header">
          <h2>Willkommen!</h2>
          <p>Gib deinen Namen ein um zu starten.</p>
        </div>
        <div className="name-form">
          <input
            className="text-input"
            type="text"
            placeholder="Dein Name (z.B. Anna)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('tipp')}
            autoFocus
            maxLength={40}
          />
          <button
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => setStep('tipp')}
          >
            Los geht's 🎯
          </button>
        </div>
        <div className="tipp-explainer">
          <h3>So funktioniert's:</h3>
          <ol>
            <li>Du tippst in <strong>drei Gruppen</strong> (Top 10 / Plätze 11–18 / Plätze 19–25)</li>
            <li>In jeder Gruppe wählst du, welches Land auf welchem Platz landet</li>
            <li>Nach dem ESC Finale werden die echten Ergebnisse eingetragen</li>
            <li>Wer am nächsten lag, gewinnt! 🏆</li>
          </ol>
        </div>
      </div>
    );
  }

  if (step === 'tipp') {
    return (
      <div className="tipp-page">
        <div className="tipp-header">
          <div className="group-progress">
            {GROUPS.map((g, i) => (
              <div key={g.key} className={`progress-dot ${i === groupIdx ? 'active' : ''} ${i < groupIdx ? 'done' : ''}`} onClick={() => setGroupIdx(i)}>
                <span>{g.emoji}</span>
                <span className="progress-label">{g.label}</span>
              </div>
            ))}
          </div>
          <h2 style={{ color: currentGroup.color }}>{currentGroup.emoji} {currentGroup.label}</h2>
          <p className="group-desc">{currentGroup.desc} – Weise jedem Platz ein Land zu</p>
        </div>

        <div className="rank-grid">
          {currentGroup.ranks.map(rank => (
            <div key={rank} className="rank-row">
              <div className="rank-badge" style={{ borderColor: currentGroup.color, color: currentGroup.color }}>
                {rank}.
              </div>
              <select
                className="country-select"
                value={assignments[rank] || ''}
                onChange={e => assignCountry(rank, e.target.value)}
                style={{ borderColor: assignments[rank] ? currentGroup.color + '88' : undefined }}
              >
                <option value="">— Land wählen —</option>
                {countries
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(c => {
                    const usedElsewhere = usedCountriesAll.includes(c.name) && assignments[rank] !== c.name;
                    return (
                      <option key={c.name} value={c.name} disabled={usedElsewhere}>
                        {usedElsewhere ? '✗ ' : ''}{c.flag} {c.name}
                      </option>
                    );
                  })}
              </select>
              {assignments[rank] && (
                <div className="artist-hint">
                  {countries.find(c => c.name === assignments[rank])?.artist}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="tipp-nav">
          {groupIdx > 0 && (
            <button className="btn-secondary" onClick={prevGroup}>← Zurück</button>
          )}
          <button
            className="btn-primary"
            disabled={!isGroupComplete}
            onClick={nextGroup}
          >
            {groupIdx < GROUPS.length - 1 ? 'Weiter →' : 'Überprüfen ✓'}
          </button>
        </div>
        {!isGroupComplete && (
          <p className="hint-text">
            Noch {currentGroup.ranks.filter(r => !assignments[r]).length} Plätze zu vergeben
          </p>
        )}
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="tipp-page">
        <div className="tipp-header">
          <h2>✅ Deine Tipps prüfen</h2>
          <p>Alles korrekt? Danach können die Tipps nicht mehr geändert werden.</p>
        </div>
        {GROUPS.map(group => (
          <div key={group.key} className="confirm-group">
            <h3 style={{ color: group.color }}>{group.emoji} {group.label}</h3>
            <div className="confirm-list">
              {group.ranks.map(rank => {
                const country = assignments[rank];
                const c = countries.find(c => c.name === country);
                return (
                  <div key={rank} className="confirm-row">
                    <span className="confirm-rank" style={{ color: group.color }}>{rank}.</span>
                    <span className="confirm-flag">{c?.flag}</span>
                    <span className="confirm-name">{country}</span>
                    <span className="confirm-artist">{c?.artist}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {error && <div className="error-msg">{error}</div>}
        <div className="tipp-nav">
          <button className="btn-secondary" onClick={() => { setStep('tipp'); setGroupIdx(0); }}>
            ← Ändern
          </button>
          <button className="btn-primary" onClick={submitTipps} disabled={saving}>
            {saving ? '⏳ Speichern...' : '🚀 Abschicken!'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="tipp-page done-page">
        <div className="done-animation">🎉</div>
        <h2>Tipps gespeichert!</h2>
        <p>Viel Erfolg, <strong>{name}</strong>! Wir sehen uns nach dem Finale.</p>
        <button className="btn-primary" onClick={onDone}>📊 Zur Rangliste</button>
      </div>
    );
  }
}
