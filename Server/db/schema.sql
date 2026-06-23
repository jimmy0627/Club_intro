-- 逢甲大學學藝性社團網站資料庫結構 (SQLite)

-- 1. 社團資料表
CREATE TABLE IF NOT EXISTS Clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    fee_info TEXT,
    location TEXT,
    time_info TEXT,
    ig_link TEXT,
    fb_link TEXT,
    line_link TEXT,
    slides_json TEXT, -- 以 JSON 格式儲存教材/簡報連結清單
    category TEXT DEFAULT '學藝性' -- 預設類別
);

-- 2. 使用者資料表 (RBAC 權限管理)
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- 實際開發應儲存 Hash
    role TEXT CHECK(role IN ('school_admin', 'club_admin')) NOT NULL,
    club_id INTEGER,
    FOREIGN KEY (club_id) REFERENCES Clubs(id) ON DELETE SET NULL
);

-- 3. 活動資料表
CREATE TABLE IF NOT EXISTS Events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    club_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location TEXT,
    image_url TEXT,
    type TEXT CHECK(type IN ('迎新', '講座', '實作課程', '社遊', '其他')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES Clubs(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 預設測試資料 (Seed Data)
-- ---------------------------------------------------------

-- 插入一個預設社團
INSERT INTO Clubs (name, description, location, time_info, category) 
VALUES ('機器人研究社', '帶領新生體驗 AI 與機器人實作的魅力。', '忠勤樓 201', '每週三 19:00', '學藝性');

-- 插入校級管理員
INSERT INTO Users (username, password, role) 
VALUES ('admin', 'admin123', 'school_admin');

-- 插入社團管理員 (關聯到 id 1 的機器人研究社)
INSERT INTO Users (username, password, role, club_id) 
VALUES ('robot_club', 'club123', 'club_admin', 1);

-- 插入一個測試活動
INSERT INTO Events (club_id, title, description, event_date, location, type) 
VALUES (1, '期初社員大會', '歡迎所有新生加入！當天有披薩與機器人表演。', '2026-09-20 18:30:00', '學思樓 101', '迎新');
