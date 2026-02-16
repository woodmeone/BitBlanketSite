-- 比特毯子网站数据库Schema
-- 适用于 Cloudflare D1

-- 随笔文章表
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 软件分享表
CREATE TABLE IF NOT EXISTS software (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  platform TEXT,
  website TEXT,
  download_url TEXT,
  hidden_content TEXT,
  icon TEXT,
  screenshots TEXT,
  rating REAL DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  usage_scenario TEXT,
  category TEXT,
  tags TEXT,
  website TEXT,
  github TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('planning', 'active', 'completed', 'archived')),
  stars INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 待办事项表
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 粉丝建议表
CREATE TABLE IF NOT EXISTS suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('topic', 'article', 'project', 'other')),
  nickname TEXT DEFAULT '匿名',
  content TEXT NOT NULL,
  reply TEXT,
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
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_software_slug ON software(slug);
CREATE INDEX IF NOT EXISTS idx_software_published ON software(published);
CREATE INDEX IF NOT EXISTS idx_software_category ON software(category);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority DESC);
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
