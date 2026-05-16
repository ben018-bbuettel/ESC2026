import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import TippPage from './components/TippPage';
import ResultsPage from './components/ResultsPage';
import AdminPage from './components/AdminPage';
import Leaderboard from './components/Leaderboard';
import './index.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [countries, setCountries] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: c }, { data: r }] = await Promise.all([
      supabase.from('countries').select('*').order('name'),
      supabase.from('results').select('*'),
    ]);
    setCountries(c || []);
    setResults(r || []);
    setLoading(false);
  }

  const resultsEntered = results.length > 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-star">⭐</div>
        <p>Lade ESC 2025...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Background stars */}
      <div className="bg-stars" aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }} />
        ))}
      </div>

      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => setPage('home')}>
            <span className="logo-icon">🎤</span>
            <span className="logo-text">ESC 2026</span>
          </div>
          <nav className="nav">
            <button className={`nav-btn ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>Start</button>
            <button className={`nav-btn ${page === 'tipp' ? 'active' : ''}`} onClick={() => setPage('tipp')}>Tippen</button>
            <button className={`nav-btn ${page === 'leaderboard' ? 'active' : ''}`} onClick={() => setPage('leaderboard')}>Rangliste</button>
            {resultsEntered && (
              <button className={`nav-btn ${page === 'results' ? 'active' : ''}`} onClick={() => setPage('results')}>Ergebnisse</button>
            )}
            <button className={`nav-btn admin-btn ${page === 'admin' ? 'active' : ''}`} onClick={() => setPage('admin')}>Admin</button>
          </nav>
        </div>
      </header>

      <main className="main">
        {page === 'home' && (
          <HomePage setPage={setPage} resultsEntered={resultsEntered} />
        )}
        {page === 'tipp' && (
          <TippPage countries={countries} onDone={() => { setPage('leaderboard'); fetchData(); }} />
        )}
        {page === 'leaderboard' && (
          <Leaderboard countries={countries} results={results} resultsEntered={resultsEntered} />
        )}
        {page === 'results' && (
          <ResultsPage results={results} countries={countries} />
        )}
        {page === 'admin' && (
          <AdminPage countries={countries} results={results} onSave={() => { fetchData(); setPage('leaderboard'); }} />
        )}
      </main>
    </div>
  );
}

function HomePage({ setPage, resultsEntered }) {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-badge">Wien 🇦🇹 2026</div>
        <h1 className="hero-title">
          <span className="title-line">Wer tippt</span>
          <span className="title-line gradient-text">am besten?</span>
        </h1>
        <p className="hero-sub">
          Tippe deine Platzierungen für die ESC-Finalisten.<br />
          Nach dem Finale sehen wir, wer die besten Vorhersagen hatte!
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setPage('tipp')}>
            🎯 Jetzt tippen
          </button>
          <button className="btn-secondary" onClick={() => setPage('leaderboard')}>
            📊 Rangliste ansehen
          </button>
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">📋</div>
          <h3>Drei Gruppen</h3>
          <p>Du tippst die Platzierungen in drei Kategorien: Top 10, Plätze 11–18 und Plätze 19–26</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🎯</div>
          <h3>Punktesystem</h3>
          <p>Exakter Treffer = volle Punkte. Je weiter daneben, desto mehr Abzug. Nahe Tipps bringen noch Punkte!</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🏆</div>
          <h3>Siegerehrung</h3>
          <p>Nach dem ESC Finale trägt der Admin die echten Ergebnisse ein – dann steht der Sieger fest!</p>
        </div>
      </div>
    </div>
  );
}
