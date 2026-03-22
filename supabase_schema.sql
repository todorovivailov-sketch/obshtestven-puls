-- ================================================
-- ОБЩЕСТВЕН ПУЛС — Supabase SQL Schema
-- Пусни в: Supabase → SQL Editor → Run
-- ================================================


-- ------------------------------------------------
-- 1. АНКЕТИ
-- ------------------------------------------------
CREATE TABLE polls (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question      TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  starts_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- 2. ВАРИАНТИ НА ОТГОВОР
-- ------------------------------------------------
CREATE TABLE poll_options (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- 3. ГЛАСОВЕ
-- ------------------------------------------------
CREATE TABLE votes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id  UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  ip_hash    TEXT NOT NULL,              -- sha256 на IP — не пазим реалния IP
  voted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_id, ip_hash)              -- 1 глас на IP на анкета
);

-- ------------------------------------------------
-- 4. СТАТИИ / КОМЕНТАРИ / АНАЛИЗИ
-- ------------------------------------------------
CREATE TABLE articles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  summary       TEXT,
  body          TEXT NOT NULL,           -- HTML съдържание (от редактор или docx конверсия)
  category      TEXT NOT NULL DEFAULT 'analysis' CHECK (category IN ('analysis', 'comment', 'news')),
  image_url     TEXT,                    -- Supabase Storage URL
  docx_url      TEXT,                    -- оригинален .docx файл (опционално)
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- 5. КОНТАКТНИ СЪОБЩЕНИЯ
-- ------------------------------------------------
CREATE TABLE contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- 6. ИНДЕКСИ за по-бързи заявки
-- ------------------------------------------------
CREATE INDEX idx_polls_status      ON polls(status);
CREATE INDEX idx_polls_created     ON polls(created_at DESC);
CREATE INDEX idx_votes_poll        ON votes(poll_id);
CREATE INDEX idx_votes_option      ON votes(option_id);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_created  ON articles(created_at DESC);

-- ------------------------------------------------
-- 7. VIEW — Резултати от анкета (брой + процент)
-- ------------------------------------------------
CREATE VIEW poll_results AS
SELECT
  p.id                                          AS poll_id,
  p.question,
  p.status,
  o.id                                          AS option_id,
  o.label,
  o.position,
  COUNT(v.id)                                   AS vote_count,
  SUM(COUNT(v.id)) OVER (PARTITION BY p.id)     AS total_votes,
  ROUND(
    COUNT(v.id) * 100.0 /
    NULLIF(SUM(COUNT(v.id)) OVER (PARTITION BY p.id), 0),
    1
  )                                             AS percentage
FROM polls p
JOIN poll_options o ON o.poll_id = p.id
LEFT JOIN votes v   ON v.option_id = o.id
GROUP BY p.id, p.question, p.status, o.id, o.label, o.position
ORDER BY p.created_at DESC, o.position;

-- ------------------------------------------------
-- 8. ФУНКЦИЯ — auto updated_at за articles
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------

-- Включване на RLS
ALTER TABLE polls             ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;

-- ПУБЛИЧНО четене на анкети и варианти
CREATE POLICY "public_read_polls"        ON polls         FOR SELECT USING (true);
CREATE POLICY "public_read_poll_options" ON poll_options  FOR SELECT USING (true);
CREATE POLICY "public_read_articles"     ON articles      FOR SELECT USING (published = true);

-- ПУБЛИЧНО гласуване (insert)
CREATE POLICY "public_vote"              ON votes         FOR INSERT WITH CHECK (true);
-- Четене на броя гласове публично
CREATE POLICY "public_read_votes"        ON votes         FOR SELECT USING (true);

-- ПУБЛИЧНО изпращане на контактна форма
CREATE POLICY "public_contact"           ON contact_messages FOR INSERT WITH CHECK (true);

-- ВСИЧКО останало → само service_role (админ от бекенда)
-- (Netlify Functions използват service_role ключ — пълен достъп)


-- ------------------------------------------------
-- 10. ALTER TABLE — нови полета
-- ------------------------------------------------

-- polls: начална дата, крайна дата, снимка, публикуване на резултати
ALTER TABLE polls ADD COLUMN IF NOT EXISTS start_date  DATE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS end_date    DATE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS image_url   TEXT;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS results_published BOOLEAN NOT NULL DEFAULT FALSE;

-- articles: добави author, направи summary nullable (не го изтриваме за съвместимост)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author   TEXT;
ALTER TABLE articles ALTER COLUMN summary DROP NOT NULL;

-- ------------------------------------------------
-- 11. ТЕСТОВИ ДАННИ (по желание)
-- ------------------------------------------------

-- Примерна анкета
INSERT INTO polls (question, description, status, ends_at)
VALUES (
  'Подкрепяте ли провеждането на предсрочни избори през 2026 г.?',
  'Анкетата изследва обществените нагласи за провеждане на предсрочни парламентарни избори.',
  'active',
  NOW() + INTERVAL '30 days'
);

-- Варианти на отговор
INSERT INTO poll_options (poll_id, label, position)
SELECT id, 'Да, подкрепям', 0 FROM polls WHERE question LIKE 'Подкрепяте%'
UNION ALL
SELECT id, 'Не, против съм', 1 FROM polls WHERE question LIKE 'Подкрепяте%'
UNION ALL
SELECT id, 'Въздържам се', 2 FROM polls WHERE question LIKE 'Подкрепяте%'
UNION ALL
SELECT id, 'Нямам мнение', 3 FROM polls WHERE question LIKE 'Подкрепяте%';

-- Примерна статия
INSERT INTO articles (title, summary, body, category, published)
VALUES (
  'Политическата нестабилност и нейното влияние върху икономиката',
  'Анализ на взаимовръзката между честите смени на правителство и инвестиционния климат в България.',
  '<p>Честите смени на правителство в България са сред основните фактори, влияещи негативно върху инвестиционния климат...</p><p>Данните от последните пет години показват...</p>',
  'analysis',
  true
);
