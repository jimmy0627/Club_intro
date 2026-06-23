require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer 設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 輔助函式：刪除圖片檔案
const deleteFileByUrl = (url) => {
    if (!url || !url.startsWith('/uploads/')) return;
    const fileName = url.replace('/uploads/', '');
    const filePath = path.join(__dirname, 'uploads', fileName);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`刪除檔案失敗: ${filePath}`, err);
        }
    }
};

let db;
async function initDB() {
    db = await open({
        filename: path.join(__dirname, 'db', 'database.sqlite'),
        driver: sqlite3.Database
    });
    console.log("資料庫已連接");
}

const authenticate = (roles = []) => {
    return (req, res, next) => {
        const { user_role, user_club_id } = req.headers; 
        if (!user_role) return res.status(401).json({ error: "未登入" });
        if (roles.length && !roles.includes(user_role)) return res.status(403).json({ error: "權限不足" });
        
        // 確保 club_id 為整數，若無則為 0
        const cid = parseInt(user_club_id);
        req.user = { role: user_role, club_id: isNaN(cid) ? 0 : cid };
        next();
    };
};

// 圖片上傳介面
app.post('/api/upload', authenticate(['school_admin', 'club_admin']), upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "未選擇檔案" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.get('/', (req, res) => {
    res.json({ message: "逢甲大學學藝性社團網站 API 伺服器運作中" });
});

app.get('/api/search', async (req, res) => {
    try {
        const { q, building, weekday } = req.query;
        if (!q && !building && !weekday) return res.json({ clubs: [], events: [] });
        
        let clubQuery = 'SELECT id, name, description, logo_url, category, building, room, weekday, time_start FROM Clubs WHERE 1=1';
        let eventQuery = 'SELECT Events.*, Clubs.name as club_name FROM Events JOIN Clubs ON Events.club_id = Clubs.id WHERE 1=1';
        let clubParams = [];
        let eventParams = [];

        if (q) {
            const searchTerm = '%' + q + '%';
            clubQuery += ' AND (name LIKE ? OR description LIKE ?)';
            clubParams.push(searchTerm, searchTerm);
            eventQuery += ' AND (Events.title LIKE ? OR Events.description LIKE ?)';
            eventParams.push(searchTerm, searchTerm);
        }

        if (building) {
            clubQuery += ' AND building = ?';
            clubParams.push(building);
            eventQuery += ' AND Events.building = ?';
            eventParams.push(building);
        }

        if (weekday) {
            clubQuery += ' AND weekday = ?';
            clubParams.push(weekday);
            eventQuery += ' AND Events.weekday = ?';
            eventParams.push(weekday);
        }

        const clubs = await db.all(clubQuery, clubParams);
        const events = await db.all(eventQuery, eventParams);
        res.json({ clubs, events });
    } catch (error) { res.status(500).json({ error: "全域搜尋失敗" }); }
});

app.get('/api/buildings', async (req, res) => {
    try {
        const clubBuildings = await db.all('SELECT DISTINCT building FROM Clubs WHERE building IS NOT NULL AND building != ""');
        const eventBuildings = await db.all('SELECT DISTINCT building FROM Events WHERE building IS NOT NULL AND building != ""');
        
        const buildings = [...new Set([...clubBuildings.map(b => b.building), ...eventBuildings.map(b => b.building)])].sort();
        res.json(buildings);
    } catch (error) { res.status(500).json({ error: "取得地點清單失敗" }); }
});

app.get('/api/clubs', async (req, res) => {
    try {
        const { search, category, building, weekday } = req.query;
        let query = 'SELECT * FROM Clubs WHERE 1=1';
        let params = [];
        if (search) { query += ' AND name LIKE ?'; params.push('%' + search + '%'); }
        if (category) { query += ' AND category = ?'; params.push(category); }
        if (building) { query += ' AND building = ?'; params.push(building); }
        if (weekday) { query += ' AND weekday = ?'; params.push(weekday); }
        const clubs = await db.all(query, params);
        res.json(clubs);
    } catch (error) { res.status(500).json({ error: "取得社團資料失敗" }); }
});

app.get('/api/clubs/:id', async (req, res) => {
    try {
        const club = await db.get('SELECT * FROM Clubs WHERE id = ?', [req.params.id]);
        if (club) res.json(club); else res.status(404).json({ error: "找不到該社團" });
    } catch (error) { res.status(500).json({ error: "取得社團詳情失敗" }); }
});

app.get('/api/clubs/:id/events', async (req, res) => {
    try {
        const events = await db.all('SELECT * FROM Events WHERE club_id = ? ORDER BY event_date ASC', [req.params.id]);
        res.json(events);
    } catch (error) { res.status(500).json({ error: "取得社團活動失敗" }); }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await db.all('SELECT Events.*, Clubs.name as club_name FROM Events JOIN Clubs ON Events.club_id = Clubs.id ORDER BY event_date ASC');
        res.json(events);
    } catch (error) { res.status(500).json({ error: "取得活動清單失敗" }); }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await db.get('SELECT Events.*, Clubs.name as club_name, Clubs.logo_url as club_logo FROM Events JOIN Clubs ON Events.club_id = Clubs.id WHERE Events.id = ?', [req.params.id]);
        if (event) res.json(event); else res.status(404).json({ error: "找不到該活動" });
    } catch (error) { res.status(500).json({ error: "取得活動詳情失敗" }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.get('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password]);
        if (user) res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, club_id: user.club_id } });
        else res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
    } catch (error) { res.status(500).json({ error: "登入處理失敗" }); }
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await db.get('SELECT id FROM Users WHERE username = ?', [username]);
        if (existingUser) return res.status(400).json({ error: "此帳號已存在" });

        // 預設身分為 student
        const result = await db.run('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)', [username, password, 'student']);
        res.status(201).json({ message: "註冊成功", userId: result.lastID });
    } catch (error) { res.status(500).json({ error: "註冊失敗" }); }
});

app.get('/api/admin/users', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    try {
        if (req.user.role === 'school_admin') {
            const users = await db.all(`
                SELECT Users.id, Users.username, Users.role, Users.club_id, Clubs.name as club_name 
                FROM Users 
                LEFT JOIN Clubs ON Users.club_id = Clubs.id
            `);
            res.json(users);
        } else {
            // 社團幹部只能看到自己社團的成員
            const users = await db.all('SELECT id, username, role, club_id FROM Users WHERE club_id = ?', [req.user.club_id]);
            res.json(users);
        }
    } catch (error) { res.status(500).json({ error: "取得用戶列表失敗" }); }
});

// 搜尋用戶 (用於新增幹部)
app.get('/api/users/search', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const { username } = req.query;
    if (!username) return res.json([]);
    try {
        const users = await db.all('SELECT id, username, role, club_id FROM Users WHERE username LIKE ? LIMIT 10', [`%${username}%`]);
        res.json(users);
    } catch (error) { res.status(500).json({ error: "搜尋用戶失敗" }); }
});

app.put('/api/admin/users/:id/role', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const { role, club_id } = req.body;
    const targetUserId = parseInt(req.params.id);
    
    try {
        const targetUser = await db.get('SELECT id, club_id, role FROM Users WHERE id = ?', [targetUserId]);
        if (!targetUser) return res.status(404).json({ error: "找不到該用戶" });

        if (req.user.role === 'club_admin') {
            // 社團幹部權促檢查
            // 不能管理其他社團的人
            if (targetUser.club_id && targetUser.club_id !== req.user.club_id) {
                return res.status(403).json({ error: "您無權管理此用戶 (該用戶屬於其他社團)" });
            }
            
            // 如果是設為 'student'，我們將其 club_id 設為 null 以將其從該社團管理名單中移除
            const updatedClubId = (role === 'student') ? null : req.user.club_id;
            await db.run('UPDATE Users SET role = ?, club_id = ? WHERE id = ?', [role, updatedClubId, targetUserId]);
        } else {
            // 校級管理員可以指定 role 與 club_id
            // 如果 role 是 student 且沒有指定 club_id，則設為 null
            const updatedClubId = (role === 'student' && !club_id) ? null : (club_id || targetUser.club_id);
            await db.run('UPDATE Users SET role = ?, club_id = ? WHERE id = ?', [role, updatedClubId, targetUserId]);
        }
        res.json({ message: "權限更新成功" });
    } catch (error) { 
        console.error("更新權限失敗:", error);
        res.status(500).json({ error: "權限更新失敗: " + error.message }); 
    }
});

app.put('/api/clubs/:id', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const clubId = parseInt(req.params.id);
    const { 
        name, description, logo_url, cover_url, fee_info, 
        building, room, ig_link, fb_link, line_link, 
        discord_link, slides_json, faq_json, registration_url, 
        registration_open, weekday, time_start, time_end 
    } = req.body;
    
    if (req.user.role === 'club_admin' && req.user.club_id !== clubId) return res.status(403).json({ error: "您無權編輯此社團" });
    try {
        const oldClub = await db.get('SELECT logo_url, cover_url FROM Clubs WHERE id = ?', [clubId]);
        if (oldClub) {
            if (logo_url && logo_url !== oldClub.logo_url) deleteFileByUrl(oldClub.logo_url);
            if (cover_url && cover_url !== oldClub.cover_url) deleteFileByUrl(oldClub.cover_url);
        }

        await db.run(`UPDATE Clubs SET 
            name = ?, description = ?, logo_url = ?, cover_url = ?, 
            fee_info = ?, building = ?, room = ?, ig_link = ?, 
            fb_link = ?, line_link = ?, discord_link = ?, slides_json = ?,
            faq_json = ?, registration_url = ?, registration_open = ?,
            weekday = ?, time_start = ?, time_end = ?
            WHERE id = ?`, 
            [name, description, logo_url, cover_url, fee_info, building, room, ig_link, fb_link, line_link, discord_link, slides_json, faq_json, registration_url, registration_open, weekday, time_start, time_end, clubId]);
        res.json({ message: "社團資訊更新成功" });
    } catch (error) { 
        console.error("更新社團失敗:", error);
        res.status(500).json({ error: "更新失敗" }); 
    }
});

// 相簿 API
app.get('/api/clubs/:id/photos', async (req, res) => {
    try {
        const photos = await db.all('SELECT * FROM ClubPhotos WHERE club_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.json(photos);
    } catch (error) { res.status(500).json({ error: "取得相簿失敗" }); }
});

app.post('/api/clubs/:id/photos', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const clubId = parseInt(req.params.id);
    const { url, description } = req.body;
    if (req.user.role === 'club_admin' && req.user.club_id !== clubId) return res.status(403).json({ error: "無權限" });
    try {
        await db.run('INSERT INTO ClubPhotos (club_id, url, description) VALUES (?, ?, ?)', [clubId, url, description]);
        res.status(201).json({ message: "照片上傳成功" });
    } catch (error) { res.status(500).json({ error: "上傳失敗" }); }
});

app.delete('/api/photos/:id', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    try {
        const photo = await db.get('SELECT * FROM ClubPhotos WHERE id = ?', [req.params.id]);
        if (!photo) return res.status(404).json({ error: "找不到照片" });
        if (req.user.role === 'club_admin' && req.user.club_id !== photo.club_id) return res.status(403).json({ error: "無權限" });
        
        deleteFileByUrl(photo.url);
        await db.run('DELETE FROM ClubPhotos WHERE id = ?', [req.params.id]);
        res.json({ message: "照片已刪除" });
    } catch (error) { res.status(500).json({ error: "刪除失敗" }); }
});

app.post('/api/events', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const { club_id, title, description, event_date, building, room, image_url, type, weekday, time_start, time_end } = req.body;
    if (req.user.role === 'club_admin' && req.user.club_id !== parseInt(club_id)) return res.status(403).json({ error: "您無權為其他社團新增活動" });
    try {
        const result = await db.run('INSERT INTO Events (club_id, title, description, event_date, building, room, image_url, type, weekday, time_start, time_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [club_id, title, description, event_date, building, room, image_url, type, weekday, time_start, time_end]);
        res.status(201).json({ message: "活動建立成功", eventId: result.lastID });
    } catch (error) { res.status(500).json({ error: "活動建立失敗" }); }
});

app.put('/api/events/:id', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const eventId = req.params.id;
    const { title, description, event_date, building, room, image_url, type, weekday, time_start, time_end } = req.body;
    try {
        const oldEvent = await db.get('SELECT * FROM Events WHERE id = ?', [eventId]);
        if (!oldEvent) return res.status(404).json({ error: "活動不存在" });
        if (req.user.role === 'club_admin' && req.user.club_id !== oldEvent.club_id) return res.status(403).json({ error: "您無權編輯此活動" });
        
        // 如果圖片網址更換，刪除舊檔案
        if (image_url && image_url !== oldEvent.image_url) {
            deleteFileByUrl(oldEvent.image_url);
        }

        await db.run('UPDATE Events SET title = ?, description = ?, event_date = ?, building = ?, room = ?, image_url = ?, type = ?, weekday = ?, time_start = ?, time_end = ? WHERE id = ?', 
            [title, description, event_date, building, room, image_url, type, weekday, time_start, time_end, eventId]);
        res.json({ message: "活動更新成功" });
    } catch (error) { res.status(500).json({ error: "更新活動失敗" }); }
});

app.delete('/api/events/:id', authenticate(['school_admin', 'club_admin']), async (req, res) => {
    const eventId = req.params.id;
    try {
        const event = await db.get('SELECT * FROM Events WHERE id = ?', [eventId]);
        if (!event) return res.status(404).json({ error: "活動不存在" });
        if (req.user.role === 'club_admin' && req.user.club_id !== event.club_id) return res.status(403).json({ error: "您無權刪除此活動" });
        
        deleteFileByUrl(event.image_url);
        await db.run('DELETE FROM Events WHERE id = ?', [eventId]);
        res.json({ message: "活動已刪除" });
    } catch (error) { res.status(500).json({ error: "刪除失敗" }); }
});

app.post('/api/clubs', authenticate(['school_admin']), async (req, res) => {
    const { name, category, building, room } = req.body;
    try {
        const result = await db.run('INSERT INTO Clubs (name, category, building, room) VALUES (?, ?, ?, ?)', [name, category, building || '', room || '']);
        res.status(201).json({ message: "社團建立成功", clubId: result.lastID });
    } catch (error) { res.status(500).json({ error: "社團建立失敗" }); }
});

app.delete('/api/clubs/:id', authenticate(['school_admin']), async (req, res) => {
    const clubId = req.params.id;
    try {
        const club = await db.get('SELECT logo_url, cover_url FROM Clubs WHERE id = ?', [clubId]);
        if (club) {
            deleteFileByUrl(club.logo_url);
            deleteFileByUrl(club.cover_url);
        }

        // 刪除相關照片及其檔案
        const photos = await db.all('SELECT url FROM ClubPhotos WHERE club_id = ?', [clubId]);
        photos.forEach(p => deleteFileByUrl(p.url));
        await db.run('DELETE FROM ClubPhotos WHERE club_id = ?', [clubId]);

        // 刪除相關活動及其檔案
        const events = await db.all('SELECT image_url FROM Events WHERE club_id = ?', [clubId]);
        events.forEach(e => deleteFileByUrl(e.image_url));
        await db.run('DELETE FROM Events WHERE club_id = ?', [clubId]);

        await db.run('DELETE FROM Clubs WHERE id = ?', [clubId]);
        await db.run('UPDATE Users SET club_id = NULL, role = "student" WHERE club_id = ?', [clubId]);
        res.json({ message: "社團及相關檔案已成功刪除" });
    } catch (error) { 
        console.error("刪除社團失敗:", error);
        res.status(500).json({ error: "刪除社團失敗" }); 
    }
});

initDB().then(() => {
    app.listen(PORT, () => { console.log('伺服器已啟動於 http://localhost:' + PORT); });
});

