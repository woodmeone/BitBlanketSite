-- 比特毯子网站数据库Schema
-- 适用于 Cloudflare D1

-- 粉丝建议表
CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('topic', 'article', 'project', 'other')),
  nickname TEXT DEFAULT '匿名',
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 投票记录表
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suggestion_id INTEGER NOT NULL,
  voter_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (suggestion_id) REFERENCES suggestions(id),
  UNIQUE(suggestion_id, voter_id)
);

-- 下载统计表
CREATE TABLE IF NOT EXISTS download_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  software_id TEXT NOT NULL,
  software_name TEXT NOT NULL,
  total_downloads INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(software_id)
);

-- 下载日志表
CREATE TABLE IF NOT EXISTS download_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  software_id TEXT NOT NULL,
  platform TEXT CHECK(platform IN ('windows', 'mac', 'linux', 'web')),
  ip_hash TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 页面访问统计表
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  views INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(path)
);

-- 网站配置表
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_votes ON suggestions(votes DESC);
CREATE INDEX IF NOT EXISTS idx_votes_suggestion ON votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_download_stats_total ON download_stats(total_downloads DESC);
CREATE INDEX IF NOT EXISTS idx_download_logs_software ON download_logs(software_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);

-- 初始化配置
INSERT OR IGNORE INTO site_config (key, value) VALUES 
  ('site_name', '比特毯子'),
  ('total_suggestions', '0'),
  ('total_votes', '0');
