-- ESC Tipp App - Supabase Schema
-- Run this in your Supabase SQL editor

-- Table: participants (users who submit tips)
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tips (each participant's ranking for each country)
CREATE TABLE IF NOT EXISTS tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  predicted_rank INTEGER NOT NULL,  -- what rank they predict for this country
  category TEXT NOT NULL,           -- 'top10', 'mid', 'lower'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, country)
);

-- Table: results (admin enters actual ESC results)
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL UNIQUE,
  actual_rank INTEGER NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: countries (the ESC 2025 finalists)
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  flag TEXT NOT NULL,
  artist TEXT,
  song TEXT
);

-- Enable Row Level Security but allow all for simplicity (no auth needed)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (public app)
CREATE POLICY "Allow all participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all tips" ON tips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all results" ON results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all countries" ON countries FOR ALL USING (true) WITH CHECK (true);

-- Insert ESC 2025 finalists (Basel, Switzerland)
INSERT INTO countries (name, flag, artist, song) VALUES
  ('Albanien', '🇦🇱', 'Shkodra Elektronike', 'Zjerm'),
  ('Armenien', '🇦🇲', 'Parg', 'Survivor'),
  ('Australien', '🇦🇺', 'Go-Jo', 'Milkshake Man'),
  ('Österreich', '🇦🇹', 'JJ', 'Wasted Love'),
  ('Aserbaidschan', '🇦🇿', 'Mamagama', 'Run With U'),
  ('Belgien', '🇧🇪', 'Red Sebastian', 'Strobe Lights'),
  ('Kroatien', '🇭🇷', 'Marko Bošnjak', 'Poison Cake'),
  ('Zypern', '🇨🇾', 'Theo Evan', 'Raining Diamonds'),
  ('Dänemark', '🇩🇰', 'Sissal', 'Hallucination'),
  ('Estland', '🇪🇪', '5Miinust & Puuluup', 'Espresso Macchiato'),
  ('Finnland', '🇫🇮', 'Erika Vikman', 'Ich Komme'),
  ('Frankreich', '🇫🇷', 'Louane', 'maman'),
  ('Deutschland', '🇩🇪', 'Abor & Tynna', 'Baller'),
  ('Georgien', '🇬🇪', 'Mariam Shengelia', 'Freedom'),
  ('Griechenland', '🇬🇷', 'Klavdia', 'Asteromáta'),
  ('Island', '🇮🇸', 'VÆB', 'Róa'),
  ('Irland', '🇮🇪', 'Emmy', 'Laika Party'),
  ('Israel', '🇮🇱', 'Yuval Raphael', 'New Day Will Rise'),
  ('Italien', '🇮🇹', 'Lucio Corsi', 'Volevo essere un duro'),
  ('Lettland', '🇱🇻', 'Tautumeitas', 'Bur man laimi'),
  ('Litauen', '🇱🇹', 'Katarsis', 'Tavo Akys'),
  ('Malta', '🇲🇹', 'Miriana Conte', 'Serving'),
  ('Moldau', '🇲🇩', 'Aquarium', 'Born To Get Wild'),
  ('Niederlande', '🇳🇱', 'Claude', 'C''est la vie'),
  ('Norwegen', '🇳🇴', 'Kyle Alessandro', 'Lighter'),
  ('Polen', '🇵🇱', 'Justyna Steczkowska', 'GAJA'),
  ('Portugal', '🇵🇹', 'Napa', 'Deslocado'),
  ('San Marino', '🇸🇲', 'Gabry Ponte', 'Tutta l''Italia'),
  ('Serbien', '🇷🇸', 'Princ', 'Mila'),
  ('Slowenien', '🇸🇮', 'Klemen', 'How Much Time Do We Have Left'),
  ('Spanien', '🇪🇸', 'Melody', 'ESA DIVA'),
  ('Schweden', '🇸🇪', 'KAJ', 'Bara Bada Bastu'),
  ('Schweiz', '🇨🇭', 'Zoë Më', 'Voyage'),
  ('Ukraine', '🇺🇦', 'Ziferblat', 'Bird of Pray'),
  ('Vereinigtes Königreich', '🇬🇧', 'Remember Monday', 'What the Hell Just Happened?')
ON CONFLICT (name) DO NOTHING;
