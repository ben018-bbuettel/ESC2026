import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// Scoring: exact = 10 pts, each rank off = -1 pt (min 0)
// Within-group bonus: if you got the country in the RIGHT group = 3 bonus pts
function calcScore(predictedRank, actualRank) {
  const diff = Math.abs(predictedRank - actualRank);
  const base = Math.max(0, 10 - diff);
  return base;
}

function getGroup(rank) {
  if (rank <= 10) return 'top10';
  if (rank <= 18) return 'mid';
  return 'lower';
}

export default function Leaderboard({ countries, results, resultsEntered }) {
  const [participants, setParticipants] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    setLoading(true);
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from('participants').select('*').order('created_at'),
      supabase.from('tips').select('*'),
    ]);
    setParticipants(p || []);
    setTips(t || []);
    setLoading(false);
  }

  if (loading) return <div className="loading-screen"><div className="loading-star">⏳</div><p>Lade Rangliste...</p></div>;

  if (participants.length === 0) {
    return (
      <div className="leaderboard-page">
        <div className="empty-state">
          <div style={{ fontSize: 64 }}>🎤</div>
          <h2>Noch keine Tipps</h2>
          <p>Sei der Erste! Tippe deine Platzierungen.</p>
        </div>
      </div>
    );
  }

  // Build scored list
  const scored = participants.map(p => {
    const myTips = tips.filter(t => t.participant_id === p.id);
    let totalScore = 0;
    let exactHits = 0;
    let groupHits = 0;

    if (resultsEntered && results.length > 0) {
      myTips.forEach(tip => {
        const actual = results.find(r => r.country === tip.country);
        if (!actual) return;
        const score = calcScore(tip.predicted_rank, actual.actual_rank);
        totalScore += score;
        if (tip.predicted_rank === actual.actual_rank) exactHits++;
        if (getGroup(tip.predicted_rank) === getGroup(actual.actual_rank)) groupHits++;
      });
    }

    return {
      ...p,
      totalScore,
      exactHits,
      groupHits,
      tipCount: myTips.length,
      tips: myTips,
    };
  });

  const sorted = resultsEntered
    ? [...scored].sort((a, b) => b.totalScore - a.totalScore || b.exactHits - a.exactHits)
    : scored;

  const maxScore = sorted[0]?.totalScore || 1;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="leaderboard-page">
      <div className="lb-header">
        <h2>📊 Rangliste</h2>
        {!resultsEntered && (
          <div className="lb-notice">
            ⏳ Ergebnisse noch nicht eingetragen – Punkte werden nach dem Finale berechnet
          </div>
        )}
        {resultsEntered && (
          <div className="lb-notice success">
            🏆 Finale ist vorbei – hier ist die endgültige Rangliste!
          </div>
        )}
      </div>

      <div className="leaderboard-list">
        {sorted.map((p, i) => (
          <ParticipantCard
            key={p.id}
            participant={p}
            rank={i + 1}
            medal={medals[i]}
            resultsEntered={resultsEntered}
            maxScore={maxScore}
            countries={countries}
            results={results}
          />
        ))}
      </div>
    </div>
  );
}

function ParticipantCard({ participant, rank, medal, resultsEntered, maxScore, countries, results }) {
  const [expanded, setExpanded] = useState(false);
  const pct = maxScore > 0 ? (participant.totalScore / maxScore) * 100 : 0;

  const GROUPS = [
    { key: 'top10', label: 'Top 10', emoji: '🥇', color: '#FFD700', ranks: Array.from({ length: 10 }, (_, i) => i + 1) },
    { key: 'mid', label: 'Plätze 11–18', emoji: '🥈', color: '#A78BFA', ranks: Array.from({ length: 8 }, (_, i) => i + 11) },
    { key: 'lower', label: 'Plätze 19–26', emoji: '🥉', color: '#60A5FA', ranks: Array.from({ length: 8 }, (_, i) => i + 19) },
  ];

  return (
    <div className={`lb-card ${rank === 1 && resultsEntered ? 'winner' : ''}`}>
      <div className="lb-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="lb-rank-medal">
          {resultsEntered ? (medal || `#${rank}`) : `#${rank}`}
        </div>
        <div className="lb-name-col">
          <span className="lb-name">{participant.name}</span>
          <span className="lb-tipdone">{participant.tipCount} / 26 getippt</span>
        </div>
        {resultsEntered && (
          <div className="lb-score-col">
            <span className="lb-score">{participant.totalScore} Pkt</span>
            <span className="lb-exact">{participant.exactHits}× exakt</span>
          </div>
        )}
        <div className="lb-expand">{expanded ? '▲' : '▼'}</div>
      </div>

      {resultsEntered && (
        <div className="lb-bar-wrap">
          <div className="lb-bar" style={{ width: `${pct}%` }} />
        </div>
      )}

      {expanded && (
        <div className="lb-detail">
          {GROUPS.map(group => {
            const groupTips = participant.tips?.filter(t => group.ranks.includes(t.predicted_rank)) || [];
            return (
              <div key={group.key} className="detail-group">
                <div className="detail-group-label" style={{ color: group.color }}>
                  {group.emoji} {group.label}
                </div>
                {groupTips.sort((a, b) => a.predicted_rank - b.predicted_rank).map(tip => {
                  const country = countries.find(c => c.name === tip.country);
                  const actual = results.find(r => r.country === tip.country);
                  const score = resultsEntered && actual ? calcScore(tip.predicted_rank, actual.actual_rank) : null;
                  const isExact = score === 10;
                  const diff = actual ? Math.abs(tip.predicted_rank - actual.actual_rank) : null;

                  return (
                    <div key={tip.id} className={`detail-row ${isExact ? 'exact-hit' : ''}`}>
                      <span className="detail-pred" style={{ color: group.color }}>{tip.predicted_rank}.</span>
                      <span className="detail-flag">{country?.flag}</span>
                      <span className="detail-name">{tip.country}</span>
                      {resultsEntered && actual && (
                        <>
                          <span className="detail-arrow">→</span>
                          <span className="detail-actual" style={{ color: isExact ? '#4ADE80' : diff <= 2 ? '#FCD34D' : '#94A3B8' }}>
                            Platz {actual.actual_rank}
                          </span>
                          <span className="detail-pts" style={{ color: isExact ? '#4ADE80' : '#94A3B8' }}>
                            {score} Pkt
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
