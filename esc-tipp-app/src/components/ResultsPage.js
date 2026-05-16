import React from 'react';

export default function ResultsPage({ results, countries }) {
  const sorted = [...results].sort((a, b) => a.actual_rank - b.actual_rank);

  const getGroup = (rank) => {
    if (rank <= 10) return { label: 'Top 10', color: '#FFD700', emoji: '🥇' };
    if (rank <= 18) return { label: '11–18', color: '#A78BFA', emoji: '🥈' };
    return { label: '19–26', color: '#60A5FA', emoji: '🥉' };
  };

  return (
    <div className="results-page">
      <div className="results-header">
        <h2>🏆 ESC 2025 Ergebnisse</h2>
        <p>Die offiziellen Platzierungen des Finales</p>
      </div>

      <div className="results-list">
        {sorted.map((r, i) => {
          const country = countries.find(c => c.name === r.country);
          const group = getGroup(r.actual_rank);
          const isTop3 = r.actual_rank <= 3;
          const medals = ['🥇', '🥈', '🥉'];

          return (
            <div key={r.id} className={`result-row ${isTop3 ? 'podium' : ''}`} style={{ '--group-color': group.color }}>
              <div className="result-rank" style={{ color: group.color }}>
                {isTop3 ? medals[r.actual_rank - 1] : r.actual_rank + '.'}
              </div>
              <div className="result-flag">{country?.flag || '🏳️'}</div>
              <div className="result-info">
                <span className="result-name">{r.country}</span>
                <span className="result-artist">{country?.artist} – {country?.song}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
